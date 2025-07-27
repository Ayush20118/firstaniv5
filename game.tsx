"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Star, Volume2, VolumeX } from "lucide-react"

interface Player {
  x: number
  y: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  onGround: boolean
  facingRight: boolean
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  type: "platform" | "collectible" | "obstacle" | "decoration"
  collected?: boolean
  color?: string
  icon?: React.ReactNode
}

interface Particle {
  x: number
  y: number
  velocityX: number
  velocityY: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface WeatherParticle {
  x: number
  y: number
  velocityX: number
  velocityY: number
  life: number
  maxLife: number
  color: string
  size: number
  type:
    | "rain"
    | "snow"
    | "petals"
    | "leaves"
    | "sparkles"
    | "wind"
    | "heavy_snow"
    | "melting_snow"
    | "spring_bloom"
    | "butterflies"
    | "humid_rain"
  rotation: number
  rotationSpeed: number
}

interface Level {
  id: number
  month: string
  title: string
  vibe: string
  challenge: string
  message: string
  backgroundColor: string
  objects: GameObject[]
  collectibles: number
  mechanic: string
  musicTempo: string
  textColor: string
  weather: string
  completionTheme: {
    background: string
    textColor: string
    accentColor: string
    vibe: string
    elements: string[]
  }
}

const levels: Level[] = [
  {
    id: 1,
    month: "August",
    title: "The Beginning",
    vibe: "warm hearts, cozy calls",
    challenge: "Just walk and collect hearts - no obstacles",
    message: "We said yes. To love, to laughter, and to calls that never ended.",
    backgroundColor: "linear-gradient(135deg, #FFB6C1, #FFA07A)",
    textColor: "#000080",
    musicTempo: "gentle",
    mechanic: "tutorial",
    weather: "rain",
    completionTheme: {
      background: "linear-gradient(135deg, #FFE4E1, #FFC0CB, #F0E68C)",
      textColor: "#8B0000",
      accentColor: "#FF69B4",
      vibe: "Soft romance, first love",
      elements: ["floating_hearts", "dreamy_light", "chat_bubbles", "raindrop_ripples"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#8FBC8F" },
      { x: 200, y: 450, width: 100, height: 20, type: "platform", color: "#98FB98" },
      { x: 400, y: 350, width: 100, height: 20, type: "platform", color: "#98FB98" },
      { x: 150, y: 400, width: 30, height: 30, type: "collectible", color: "#DC143C", icon: <Heart size={20} /> },
      { x: 450, y: 300, width: 30, height: 30, type: "collectible", color: "#DC143C", icon: <Heart size={20} /> },
      { x: 600, y: 500, width: 30, height: 30, type: "collectible", color: "#DC143C", icon: <Heart size={20} /> },
    ],
    collectibles: 3,
  },
  {
    id: 2,
    month: "September",
    title: "My Birthday, Your Wish",
    vibe: "festive, night lights, cake and music",
    challenge: "Pop balloons by jumping into them while avoiding falling ones",
    message: "Celebrating me, miles apart. But your voice was my gift.",
    backgroundColor: "linear-gradient(135deg, #4B0082, #8A2BE2)",
    textColor: "#FFFFFF",
    musicTempo: "celebratory",
    mechanic: "balloon_popping",
    weather: "leaves",
    completionTheme: {
      background: "linear-gradient(135deg, #2F1B69, #8B4513, #D2691E)",
      textColor: "#FFE4B5",
      accentColor: "#FFD700",
      vibe: "Cozy, reflective birthday energy",
      elements: ["streamers", "music_notes", "candle_flicker", "sleeping_avatar"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#2F4F4F" },
      { x: 150, y: 450, width: 80, height: 20, type: "platform", color: "#696969" },
      { x: 350, y: 350, width: 80, height: 20, type: "platform", color: "#696969" },
      { x: 550, y: 450, width: 80, height: 20, type: "platform", color: "#696969" },
      { x: 100, y: 200, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 300, y: 150, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 500, y: 180, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 650, y: 220, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 4,
  },
  {
    id: 3,
    month: "October",
    title: "Rings Under the Stars",
    vibe: "stars, mountain edge, cool winds",
    challenge: "Sneak past moving suspicion clouds - hide behind rocks when they look",
    message: "That mountain held our secret. And the stars witnessed our promise.",
    backgroundColor: "linear-gradient(135deg, #191970, #4169E1)",
    textColor: "#FFFFFF",
    musicTempo: "mysterious",
    mechanic: "stealth",
    weather: "leaves",
    completionTheme: {
      background: "linear-gradient(135deg, #0F0F23, #2F4F4F, #B8860B)",
      textColor: "#F0E68C",
      accentColor: "#FFD700",
      vibe: "Adventurous, magical mountain romance",
      elements: ["shooting_stars", "moving_clouds", "ring_exchange", "mountain_scroll"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#2F4F4F" },
      { x: 100, y: 480, width: 60, height: 15, type: "platform", color: "#708090" },
      { x: 250, y: 400, width: 60, height: 15, type: "platform", color: "#708090" },
      { x: 450, y: 320, width: 60, height: 15, type: "platform", color: "#708090" },
      { x: 650, y: 450, width: 60, height: 15, type: "platform", color: "#708090" },
      { x: 180, y: 350, width: 40, height: 50, type: "obstacle", color: "#696969" },
      { x: 380, y: 270, width: 40, height: 50, type: "obstacle", color: "#696969" },
      { x: 580, y: 400, width: 40, height: 50, type: "obstacle", color: "#696969" },
      { x: 130, y: 430, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 280, y: 350, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 480, y: 270, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 680, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 4,
  },
  {
    id: 4,
    month: "November",
    title: "Craving & Chaos",
    vibe: "dark red and candles, slightly chaotic",
    challenge: "Dodge falling argument bombs that explode on impact",
    message: "Between love and fights, we still chose each other. Every time.",
    backgroundColor: "linear-gradient(135deg, #8B0000, #DC143C)",
    textColor: "#F0F8FF",
    musicTempo: "intense",
    mechanic: "dodge_falling",
    weather: "wind",
    completionTheme: {
      background: "linear-gradient(135deg, #4B0000, #8B0000, #DC143C)",
      textColor: "#FFE4E1",
      accentColor: "#FF6347",
      vibe: "Intimate and intense passion",
      elements: ["red_purple_glow", "crackling_static", "heart_flame", "argument_text"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#2F4F4F" },
      { x: 120, y: 470, width: 80, height: 15, type: "platform", color: "#8B4513" },
      { x: 300, y: 390, width: 80, height: 15, type: "platform", color: "#8B4513" },
      { x: 500, y: 470, width: 80, height: 15, type: "platform", color: "#8B4513" },
      { x: 150, y: 420, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 330, y: 340, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 530, y: 420, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 3,
  },
  {
    id: 5,
    month: "December",
    title: "The Silence Phase",
    vibe: "snowy streets, dim lights, empty benches",
    challenge: "Navigate slippery ice platforms while avoiding miscommunication walls",
    message: "Even in the quiet, I searched for you. And you were still there.",
    backgroundColor: "linear-gradient(135deg, #4682B4, #B0C4DE)",
    textColor: "#191970",
    musicTempo: "melancholic",
    mechanic: "ice_physics",
    weather: "snow",
    completionTheme: {
      background: "linear-gradient(135deg, #2F4F4F, #708090, #B0C4DE)",
      textColor: "#F8F8FF",
      accentColor: "#87CEEB",
      vibe: "Lonely, emotional winter",
      elements: ["window_fog", "lonely_figure", "glowing_phone", "unread_messages"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#F0F8FF" },
      { x: 150, y: 450, width: 80, height: 20, type: "platform", color: "#E0FFFF" },
      { x: 300, y: 380, width: 80, height: 20, type: "platform", color: "#E0FFFF" },
      { x: 450, y: 350, width: 80, height: 20, type: "platform", color: "#E0FFFF" },
      { x: 600, y: 450, width: 80, height: 20, type: "platform", color: "#E0FFFF" },
      { x: 100, y: 480, width: 15, height: 70, type: "obstacle", color: "#708090" },
      { x: 250, y: 450, width: 15, height: 100, type: "obstacle", color: "#708090" },
      { x: 400, y: 420, width: 15, height: 130, type: "obstacle", color: "#708090" },
      { x: 550, y: 480, width: 15, height: 70, type: "obstacle", color: "#708090" },
      { x: 180, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 330, y: 330, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 480, y: 300, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 3,
  },
  {
    id: 6,
    month: "January",
    title: "One Mic Missing",
    vibe: "concert stage, glowing lights but with an empty second mic",
    challenge: "Move to the rhythm - only move when the beat hits",
    message: "I was in the crowd. You were in my heart. That was enough.",
    backgroundColor: "linear-gradient(135deg, #000080, #4169E1)",
    textColor: "#FFFACD",
    musicTempo: "rhythmic",
    mechanic: "rhythm",
    weather: "heavy_snow",
    completionTheme: {
      background: "linear-gradient(135deg, #000033, #191970, #4169E1)",
      textColor: "#F0F8FF",
      accentColor: "#FFD700",
      vibe: "High energy outside, emptiness inside",
      elements: ["concert_crowd", "spotlight_sweep", "birthday_card", "distant_fireworks"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#2F4F4F" },
      { x: 100, y: 450, width: 80, height: 20, type: "platform", color: "#8B4513" },
      { x: 300, y: 420, width: 80, height: 20, type: "platform", color: "#8B4513" },
      { x: 500, y: 450, width: 80, height: 20, type: "platform", color: "#8B4513" },
      { x: 130, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 330, y: 370, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 530, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 3,
  },
  {
    id: 7,
    month: "February",
    title: "Valentine in Transit",
    vibe: "red roses, flying gift boxes, glitter hearts",
    challenge: "Fly by holding space to collect floating hearts across distances",
    message: "Distance tried. But love won. So many times.",
    backgroundColor: "linear-gradient(135deg, #FF1493, #FFB6C1)",
    textColor: "#8B0000",
    musicTempo: "romantic",
    mechanic: "flying",
    weather: "melting_snow",
    completionTheme: {
      background: "linear-gradient(135deg, #FF69B4, #FFB6C1, #FFC0CB)",
      textColor: "#8B0000",
      accentColor: "#DC143C",
      vibe: "Full of love and romance",
      elements: ["unwrapping_gifts", "flying_hearts", "love_letter", "polaroid_moments"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#8FBC8F" },
      { x: 100, y: 450, width: 100, height: 20, type: "platform", color: "#98FB98" },
      { x: 650, y: 450, width: 100, height: 20, type: "platform", color: "#98FB98" },
      { x: 200, y: 300, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 350, y: 200, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 500, y: 150, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 400, y: 350, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 300, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 5,
  },
  {
    id: 8,
    month: "March",
    title: "Finals & Faith",
    vibe: "study desk, flying books, ticking clocks",
    challenge: "Race against time - platforms move and disappear quickly",
    message: "I saw you fight through the pressure. I never stopped believing in you.",
    backgroundColor: "linear-gradient(135deg, #2F4F4F, #708090)",
    textColor: "#FFFFFF",
    musicTempo: "urgent",
    mechanic: "time_pressure",
    weather: "spring_bloom",
    completionTheme: {
      background: "linear-gradient(135deg, #556B2F, #6B8E23, #9ACD32)",
      textColor: "#FFFAF0",
      accentColor: "#ADFF2F",
      vibe: "Focused, stressed but strong",
      elements: ["ticking_clock", "sticky_notes", "blooming_flowers", "encouragement_messages"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#8B4513" },
      { x: 80, y: 480, width: 60, height: 15, type: "platform", color: "#D2B48C" },
      { x: 200, y: 420, width: 60, height: 15, type: "platform", color: "#D2B48C" },
      { x: 350, y: 360, width: 60, height: 15, type: "platform", color: "#D2B48C" },
      { x: 500, y: 420, width: 60, height: 15, type: "platform", color: "#D2B48C" },
      { x: 620, y: 480, width: 60, height: 15, type: "platform", color: "#D2B48C" },
      { x: 110, y: 430, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 230, y: 370, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 380, y: 310, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 530, y: 370, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 4,
  },
  {
    id: 9,
    month: "April",
    title: "Wings & Waves",
    vibe: "airplane clouds and beach waves",
    challenge: "Control airplane physics - hold space to ascend, release to descend",
    message: "Your first flight. Our first beach. My favorite hello.",
    backgroundColor: "linear-gradient(135deg, #87CEEB, #F0F8FF)",
    textColor: "#191970",
    musicTempo: "soaring",
    mechanic: "airplane",
    weather: "petals",
    completionTheme: {
      background: "linear-gradient(135deg, #87CEEB, #F0F8FF, #F4A460)",
      textColor: "#191970",
      accentColor: "#FF6347",
      vibe: "Exciting and heartwarming travel",
      elements: ["plane_heart_trail", "ocean_waves", "sand_initials", "beach_shells"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#F4A460" },
      { x: 100, y: 450, width: 80, height: 20, type: "platform", color: "#F0F8FF" },
      { x: 250, y: 380, width: 80, height: 20, type: "platform", color: "#F0F8FF" },
      { x: 400, y: 320, width: 80, height: 20, type: "platform", color: "#F0F8FF" },
      { x: 550, y: 450, width: 80, height: 20, type: "platform", color: "#F0F8FF" },
      { x: 180, y: 500, width: 40, height: 30, type: "obstacle", color: "#D3D3D3" },
      { x: 330, y: 520, width: 40, height: 30, type: "obstacle", color: "#D3D3D3" },
      { x: 130, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 280, y: 330, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 430, y: 270, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 580, y: 400, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 4,
  },
  {
    id: 10,
    month: "May",
    title: "Bittersweet in Delhi",
    vibe: "Delhi skyline, metro, laughter",
    challenge: "Control two characters - walk together, then one must stay behind",
    message: "Another beautiful chapter. And another painful goodbye.",
    backgroundColor: "linear-gradient(135deg, #FF8C00, #FFA500)",
    textColor: "#8B0000",
    musicTempo: "bittersweet",
    mechanic: "two_characters",
    weather: "butterflies",
    completionTheme: {
      background: "linear-gradient(135deg, #FF8C00, #FFA500, #FFD700)",
      textColor: "#8B0000",
      accentColor: "#FF4500",
      vibe: "Joy mixed with sadness",
      elements: ["delhi_icons", "hug_to_wave", "rolling_suitcase", "fast_forward_clock"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#2F4F4F" },
      { x: 100, y: 480, width: 100, height: 15, type: "platform", color: "#696969" },
      { x: 300, y: 420, width: 100, height: 15, type: "platform", color: "#696969" },
      { x: 500, y: 360, width: 100, height: 15, type: "platform", color: "#696969" },
      { x: 600, y: 480, width: 5, height: 70, type: "obstacle", color: "#FF0000" },
      { x: 130, y: 430, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 330, y: 370, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 530, y: 310, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 680, y: 430, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 4,
  },
  {
    id: 11,
    month: "June",
    title: "Dreams Take Flight",
    vibe: "celebration confetti and art school sketches",
    challenge: "Solve admission form puzzle - step on switches in correct order",
    message: "You got in. You made it. And I'm so, so proud of you.",
    backgroundColor: "linear-gradient(135deg, #32CD32, #98FB98)",
    textColor: "#006400",
    musicTempo: "triumphant",
    mechanic: "puzzle",
    weather: "humid_rain",
    completionTheme: {
      background: "linear-gradient(135deg, #32CD32, #98FB98, #ADFF2F)",
      textColor: "#006400",
      accentColor: "#FFD700",
      vibe: "Happy and fulfilled dreams",
      elements: ["admission_letter", "art_supplies", "confetti_burst", "checklist_ticks"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#8FBC8F" },
      { x: 120, y: 470, width: 80, height: 20, type: "platform", color: "#98FB98" },
      { x: 280, y: 400, width: 80, height: 20, type: "platform", color: "#98FB98" },
      { x: 450, y: 330, width: 80, height: 20, type: "platform", color: "#98FB98" },
      { x: 600, y: 470, width: 80, height: 20, type: "platform", color: "#98FB98" },
      { x: 200, y: 520, width: 30, height: 30, type: "obstacle", color: "#4169E1" },
      { x: 360, y: 520, width: 30, height: 30, type: "obstacle", color: "#4169E1" },
      { x: 520, y: 520, width: 30, height: 30, type: "obstacle", color: "#4169E1" },
      { x: 150, y: 420, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 310, y: 350, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 480, y: 280, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 630, y: 420, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 4,
  },
  {
    id: 12,
    month: "July",
    title: "One Year Strong",
    vibe: "fireworks, celebration lights, heart balloons",
    challenge: "Victory lap - fireworks launch you higher with each jump",
    message: "Through highs and lows, we made it. One year. One love. Infinite memories.",
    backgroundColor: "linear-gradient(135deg, #FFD700, #FFA500)",
    textColor: "#8B0000",
    musicTempo: "celebration",
    mechanic: "fireworks",
    weather: "rain",
    completionTheme: {
      background: "linear-gradient(135deg, #FFD700, #FFA500, #FF6347)",
      textColor: "#8B0000",
      accentColor: "#DC143C",
      vibe: "Celebration and gratitude",
      elements: ["photo_collage", "one_year_banner", "heart_fireworks", "memory_swirl"],
    },
    objects: [
      { x: 0, y: 550, width: 800, height: 50, type: "platform", color: "#8FBC8F" },
      { x: 100, y: 480, width: 120, height: 20, type: "platform", color: "#98FB98" },
      { x: 300, y: 420, width: 120, height: 20, type: "platform", color: "#98FB98" },
      { x: 500, y: 480, width: 120, height: 20, type: "platform", color: "#98FB98" },
      { x: 130, y: 430, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 330, y: 370, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 530, y: 430, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 200, y: 500, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 400, y: 500, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
      { x: 600, y: 500, width: 30, height: 30, type: "collectible", color: "#FFD700", icon: <Heart size={20} /> },
    ],
    collectibles: 6,
  },
]

export default function OneYearWithYou() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "gameComplete" | "graffitiWall">(
    "menu",
  )
  const [currentLevel, setCurrentLevel] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 500,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    facingRight: true,
  })
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({})
  const [collectedItems, setCollectedItems] = useState(0)
  const [levelObjects, setLevelObjects] = useState<GameObject[]>([])
  const [showMessage, setShowMessage] = useState(false)
  const [levelTime, setLevelTime] = useState(0)
  const [balloonPositions, setBalloonPositions] = useState<{ [key: number]: { y: number; direction: number } }>({})
  const [suspicionClouds, setSuspicionClouds] = useState<{ x: number; direction: number; looking: boolean }[]>([])
  const [fallingBombs, setFallingBombs] = useState<{ x: number; y: number; velocityY: number }[]>([])
  const [rhythmBeat, setRhythmBeat] = useState(false)
  const [canMove, setCanMove] = useState(true)
  const [isFlying, setIsFlying] = useState(false)
  const [platformTimer, setPlatformTimer] = useState(0)
  const [isAirplane, setIsAirplane] = useState(false)
  const [secondPlayer, setSecondPlayer] = useState<Player | null>(null)
  const [puzzleSwitches, setPuzzleSwitches] = useState<boolean[]>([false, false, false])
  const [fireworksActive, setFireworksActive] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [animationTime, setAnimationTime] = useState(0)
  const [backgroundParticles, setBackgroundParticles] = useState<Particle[]>([])
  const [weatherParticles, setWeatherParticles] = useState<WeatherParticle[]>([])
  const [transitionState, setTransitionState] = useState<"none" | "heartWipe" | "fadeIn">("none")
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [floatingHearts, setFloatingHearts] = useState<Particle[]>([])
  const [completionAnimationTime, setCompletionAnimationTime] = useState(0)
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)
  const [sparkleParticles, setSparkleParticles] = useState<Particle[]>([])

  // Audio setup
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      const audio = new Audio("https://cdn.jsdelivr.net/gh/Ayush20118/Lagjagale/Lag%20Ja%20Gale%20Instrumental.mp3")
      audio.loop = true
      audio.volume = isMuted ? 0 : 0.3
      audioRef.current = audio
    }

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3
      
      // Start playing when game starts (not menu) and keep playing throughout
      if (gameState !== "menu") {
        audioRef.current.play().catch(console.log)
      } else {
        audioRef.current.pause()
      }
    }
  }, [gameState, isMuted])

  const addFloatingHeart = useCallback((x: number, y: number) => {
    setFloatingHearts((prev) => [
      ...prev,
      {
        x,
        y,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: -2 - Math.random() * 2,
        life: 180,
        maxLife: 180,
        color: "#FF69B4",
        size: 12 + Math.random() * 8,
      },
    ])
  }, [])

  const addSparkleParticle = useCallback((x: number, y: number) => {
    for (let i = 0; i < 8; i++) {
      setSparkleParticles((prev) => [
        ...prev,
        {
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: (Math.random() - 0.5) * 4 - 1,
          life: 60 + Math.random() * 60,
          maxLife: 120,
          color: `hsl(${Math.random() * 60 + 40}, 80%, 70%)`,
          size: 2 + Math.random() * 3,
        },
      ])
    }
  }, [])

  const updateFloatingHearts = useCallback(() => {
    setFloatingHearts((prev) =>
      prev
        .map((heart) => ({
          ...heart,
          x: heart.x + heart.velocityX,
          y: heart.y + heart.velocityY,
          life: heart.life - 1,
        }))
        .filter((heart) => heart.life > 0),
    )
  }, [])

  const updateSparkleParticles = useCallback(() => {
    setSparkleParticles((prev) =>
      prev
        .map((sparkle) => ({
          ...sparkle,
          x: sparkle.x + sparkle.velocityX,
          y: sparkle.y + sparkle.velocityY,
          velocityY: sparkle.velocityY + 0.1,
          life: sparkle.life - 1,
        }))
        .filter((sparkle) => sparkle.life > 0),
    )
  }, [])

  const addWeatherParticle = useCallback((type: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const weatherConfigs = {
      rain: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -1 + Math.random() * 2,
        velocityY: 4 + Math.random() * 3,
        color: "rgba(173, 216, 230, 0.7)",
        size: 1 + Math.random() * 2,
        life: 200,
      },
      snow: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -0.5 + Math.random() * 1,
        velocityY: 1 + Math.random() * 2,
        color: "rgba(255, 255, 255, 0.9)",
        size: 2 + Math.random() * 3,
        life: 300,
      },
      heavy_snow: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -1 + Math.random() * 2,
        velocityY: 2 + Math.random() * 3,
        color: "rgba(255, 255, 255, 0.8)",
        size: 3 + Math.random() * 4,
        life: 350,
      },
      melting_snow: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -0.5 + Math.random() * 1,
        velocityY: 1.5 + Math.random() * 2,
        color: "rgba(200, 230, 255, 0.6)",
        size: 1.5 + Math.random() * 2,
        life: 250,
      },
      petals: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -2 + Math.random() * 4,
        velocityY: 2 + Math.random() * 2,
        color: `hsl(${320 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`,
        size: 3 + Math.random() * 4,
        life: 400,
      },
      leaves: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -1.5 + Math.random() * 3,
        velocityY: 1.5 + Math.random() * 2,
        color: `hsl(${20 + Math.random() * 40}, 60%, ${40 + Math.random() * 30}%)`,
        size: 3 + Math.random() * 5,
        life: 350,
      },
      wind: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: Math.random() * canvas.height,
        velocityX: 3 + Math.random() * 4,
        velocityY: -0.5 + Math.random() * 1,
        color: "rgba(200, 200, 200, 0.3)",
        size: 1 + Math.random() * 2,
        life: 150,
      },
      spring_bloom: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        velocityX: -0.5 + Math.random() * 1,
        velocityY: -1 + Math.random() * 2,
        color: `hsl(${300 + Math.random() * 60}, 70%, 80%)`,
        size: 2 + Math.random() * 3,
        life: 200,
      },
      butterflies: {
        x: Math.random() * canvas.width,
        y: 100 + Math.random() * 300,
        velocityX: -1 + Math.random() * 2,
        velocityY: -0.5 + Math.random() * 1,
        color: `hsl(${40 + Math.random() * 80}, 60%, 60%)`,
        size: 4 + Math.random() * 3,
        life: 400,
      },
      humid_rain: {
        x: Math.random() * (canvas.width + 100) - 50,
        y: -10,
        velocityX: -0.5 + Math.random() * 1,
        velocityY: 3 + Math.random() * 2,
        color: "rgba(150, 200, 230, 0.5)",
        size: 1 + Math.random() * 2,
        life: 180,
      },
      sparkles: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        velocityX: -0.5 + Math.random() * 1,
        velocityY: -0.5 + Math.random() * 1,
        color: `hsl(${Math.random() * 60 + 40}, 80%, 70%)`,
        size: 1 + Math.random() * 2,
        life: 120,
      },
    }

    const config = weatherConfigs[type as keyof typeof weatherConfigs]
    if (!config) return

    setWeatherParticles((prev) => [
      ...prev,
      {
        ...config,
        type: type as WeatherParticle["type"],
        maxLife: config.life,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      },
    ])
  }, [])

  const updateWeatherParticles = useCallback(() => {
    setWeatherParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          rotation: particle.rotation + particle.rotationSpeed,
          life: particle.life - 1,
        }))
        .filter((particle) => particle.life > 0 && particle.y < 650),
    )
  }, [])

  // Heart transition effect
  const startHeartTransition = useCallback(() => {
    setTransitionState("heartWipe")
    setTransitionProgress(0)

    const animateTransition = () => {
      setTransitionProgress((prev) => {
        const newProgress = prev + 0.02
        if (newProgress >= 1) {
          setTransitionState("fadeIn")
          setTimeout(() => {
            setTransitionState("none")
            setTransitionProgress(0)
          }, 500)
          return 1
        }
        requestAnimationFrame(animateTransition)
        return newProgress
      })
    }
    requestAnimationFrame(animateTransition)
  }, [])

  const resetLevel = useCallback(() => {
    const level = levels[currentLevel]
    if (!level) return

    setPlayer({
      x: 50,
      y: 500,
      width: 30,
      height: 40,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      facingRight: true,
    })
    setLevelObjects(level.objects.map((obj) => ({ ...obj, collected: false })))
    setCollectedItems(0)
    setShowMessage(false)

    // Reset level-specific states
    setLevelTime(0)
    setBalloonPositions({})
    setSuspicionClouds([])
    setFallingBombs([])
    setRhythmBeat(false)
    setCanMove(true)
    setIsFlying(false)
    setPlatformTimer(0)
    setIsAirplane(false)
    setSecondPlayer(null)
    setPuzzleSwitches([false, false, false])
    setFireworksActive(false)
    setParticles([])
    setBackgroundParticles([])
    setWeatherParticles([])
  }, [currentLevel])

  useEffect(() => {
    if (gameState === "playing") {
      resetLevel()
    }
  }, [gameState, currentLevel, resetLevel])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
      }
      setKeys((prev) => ({ ...prev, [e.code]: true }))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.code]: false }))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime((prev) => prev + 1)
      if (gameState === "levelComplete") {
        setCompletionAnimationTime((prev) => prev + 1)
      }
    }, 16) // ~60fps
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    if (gameState === "playing") {
      const level = levels[currentLevel]
      if (!level) return

      const weatherInterval = setInterval(
        () => {
          // Heavily optimize July to prevent lag
          const particleCount =
            level.month === "July"
              ? 1 // Minimal particles for July
              : level.weather === "snow" || level.weather === "heavy_snow"
                ? 4
                : level.weather === "rain" || level.weather === "humid_rain"
                  ? 6
                  : 3

          for (let i = 0; i < particleCount; i++) {
            addWeatherParticle(level.weather)
          }
        },
        level.month === "July" ? 300 : 150, // Much slower generation for July
      )

      return () => clearInterval(weatherInterval)
    }
  }, [gameState, currentLevel, addWeatherParticle])

  // Update particles
  useEffect(() => {
    if (gameState === "graffitiWall") {
      const interval = setInterval(() => {
        updateFloatingHearts()
        updateSparkleParticles()
      }, 16)
      return () => clearInterval(interval)
    }
  }, [gameState, updateFloatingHearts, updateSparkleParticles])

  const addParticle = (x: number, y: number, color: string) => {
    setParticles((prev) => [
      ...prev,
      {
        x,
        y,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: (Math.random() - 0.5) * 4 - 2,
        life: 60,
        maxLife: 60,
        color,
        size: Math.random() * 4 + 2,
      },
    ])
  }

  const addBackgroundParticle = (x: number, y: number, color: string, velocityX = 0, velocityY = 0) => {
    setBackgroundParticles((prev) => [
      ...prev,
      {
        x,
        y,
        velocityX,
        velocityY,
        life: 120,
        maxLife: 120,
        color,
        size: Math.random() * 3 + 1,
      },
    ])
  }

  const updateParticles = () => {
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          velocityY: particle.velocityY + 0.1,
          life: particle.life - 1,
        }))
        .filter((particle) => particle.life > 0),
    )

    setBackgroundParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          life: particle.life - 1,
        }))
        .filter((particle) => particle.life > 0),
    )

    updateWeatherParticles()
  }

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return

    const canvas = canvasRef.current
    if (!canvas) return

    const level = levels[currentLevel]
    if (!level) return

    // Update level timer
    setLevelTime((prev) => prev + 1)

    // Update particles
    updateParticles()

    // Update floating hearts
    updateFloatingHearts()

    // Add level-specific background particles (reduced for July)
    if (levelTime % (level.month === "July" ? 60 : 30) === 0) {
      switch (level.mechanic) {
        case "balloon_popping":
          addBackgroundParticle(Math.random() * 800, -10, "#FFD700", 0, 2)
          break
        case "stealth":
          addBackgroundParticle(Math.random() * 800, Math.random() * 300, "#FFFFFF", 0, 0)
          break
        case "flying":
          addBackgroundParticle(-10, Math.random() * 400 + 100, "#FFB6C1", 3, 0)
          break
        case "ice_physics":
          addBackgroundParticle(Math.random() * 800, -10, "#FFFFFF", 0, 1)
          break
        case "fireworks":
          // Reduce fireworks particles for July
          if (level.month !== "July") {
            addBackgroundParticle(
              Math.random() * 800,
              Math.random() * 200,
              `hsl(${Math.random() * 360}, 70%, 60%)`,
              0,
              0,
            )
          }
          break
      }
    }

    // Handle different level mechanics
    switch (level.mechanic) {
      case "balloon_popping":
        setBalloonPositions((prev) => {
          const newPositions = { ...prev }
          levelObjects.forEach((obj, index) => {
            if (obj && obj.type === "collectible" && !obj.collected) {
              if (!newPositions[index]) {
                newPositions[index] = { y: obj.y, direction: 1 }
              }
              newPositions[index].y += newPositions[index].direction * 2
              if (newPositions[index].y < 100 || newPositions[index].y > 400) {
                newPositions[index].direction *= -1
              }
            }
          })
          return newPositions
        })
        break

      case "stealth":
        setSuspicionClouds((prev) => {
          if (prev.length === 0) {
            return [
              { x: 200, direction: 1, looking: false },
              { x: 400, direction: -1, looking: false },
              { x: 600, direction: 1, looking: false },
            ]
          }
          return prev.map((cloud) => ({
            ...cloud,
            x: cloud.x + cloud.direction * 1,
            looking: Math.sin(levelTime * 0.1) > 0.5,
            direction: cloud.x < 50 || cloud.x > 750 ? -cloud.direction : cloud.direction,
          }))
        })
        break

      case "dodge_falling":
        if (levelTime % 60 === 0) {
          setFallingBombs((prev) => [
            ...prev,
            {
              x: Math.random() * 700 + 50,
              y: 0,
              velocityY: 3 + Math.random() * 3,
            },
          ])
        }
        setFallingBombs((prev) =>
          prev
            .map((bomb) => ({
              ...bomb,
              y: bomb.y + bomb.velocityY,
            }))
            .filter((bomb) => bomb.y < 600),
        )
        break

      case "rhythm":
        setRhythmBeat(Math.floor(levelTime / 30) % 2 === 0)
        setCanMove(rhythmBeat)
        break

      case "time_pressure":
        setPlatformTimer((prev) => prev + 1)
        break
    }

    // Update player movement with level-specific mechanics
    setPlayer((prevPlayer) => {
      const newPlayer = { ...prevPlayer }

      switch (level.mechanic) {
        case "ice_physics":
          if (keys["ArrowLeft"] || keys["KeyA"]) {
            newPlayer.velocityX = Math.max(newPlayer.velocityX - 0.3, -7)
            newPlayer.facingRight = false
          } else if (keys["ArrowRight"] || keys["KeyD"]) {
            newPlayer.velocityX = Math.min(newPlayer.velocityX + 0.3, 7)
            newPlayer.facingRight = true
          } else {
            newPlayer.velocityX *= 0.95
          }

          if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && newPlayer.onGround) {
            newPlayer.velocityY = -15
            newPlayer.onGround = false
            addParticle(newPlayer.x + newPlayer.width / 2, newPlayer.y + newPlayer.height, "#87CEEB")
          }
          break

        case "flying":
          if (keys["Space"]) {
            setIsFlying(true)
            newPlayer.velocityY = Math.max(newPlayer.velocityY - 1, -8)
            if (levelTime % 5 === 0) {
              addParticle(newPlayer.x + Math.random() * newPlayer.width, newPlayer.y + newPlayer.height, "#FFB6C1")
            }
          } else {
            setIsFlying(false)
            newPlayer.velocityY += 0.5
          }
          if (keys["ArrowLeft"] || keys["KeyA"]) {
            newPlayer.velocityX = -5
            newPlayer.facingRight = false
          } else if (keys["ArrowRight"] || keys["KeyD"]) {
            newPlayer.velocityX = 5
            newPlayer.facingRight = true
          } else {
            newPlayer.velocityX *= 0.8
          }
          break

        case "airplane":
          setIsAirplane(true)
          if (keys["Space"]) {
            newPlayer.velocityY = Math.max(newPlayer.velocityY - 0.8, -6)
          } else {
            newPlayer.velocityY = Math.min(newPlayer.velocityY + 0.5, 6)
          }

          if (keys["ArrowLeft"] || keys["KeyA"]) {
            newPlayer.velocityX = Math.max(newPlayer.velocityX - 0.5, -8)
            newPlayer.facingRight = false
          } else if (keys["ArrowRight"] || keys["KeyD"]) {
            newPlayer.velocityX = Math.min(newPlayer.velocityX + 0.5, 8)
            newPlayer.facingRight = true
          } else {
            newPlayer.velocityX *= 0.98
          }

          if (levelTime % 3 === 0) {
            addParticle(newPlayer.x - 5, newPlayer.y + newPlayer.height / 2, "#87CEEB")
          }
          break

        case "fireworks":
          if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && newPlayer.onGround) {
            newPlayer.velocityY = -20
            setFireworksActive(true)
            newPlayer.onGround = false
            // Reduce fireworks particles for July
            const particleCount = level.month === "July" ? 3 : 10
            for (let i = 0; i < particleCount; i++) {
              addParticle(
                newPlayer.x + newPlayer.width / 2,
                newPlayer.y + newPlayer.height,
                `hsl(${Math.random() * 360}, 70%, 60%)`,
              )
            }
          }
          if (keys["ArrowLeft"] || keys["KeyA"]) {
            newPlayer.velocityX = -5
            newPlayer.facingRight = false
          } else if (keys["ArrowRight"] || keys["KeyD"]) {
            newPlayer.velocityX = 5
            newPlayer.facingRight = true
          } else {
            newPlayer.velocityX *= 0.8
          }
          break

        case "rhythm":
          if (canMove) {
            if (keys["ArrowLeft"] || keys["KeyA"]) {
              newPlayer.velocityX = -5
              newPlayer.facingRight = false
            } else if (keys["ArrowRight"] || keys["KeyD"]) {
              newPlayer.velocityX = 5
              newPlayer.facingRight = true
            } else {
              newPlayer.velocityX *= 0.8
            }
            if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && newPlayer.onGround) {
              newPlayer.velocityY = -15
              newPlayer.onGround = false
            }
          }
          break

        default:
          if (keys["ArrowLeft"] || keys["KeyA"]) {
            newPlayer.velocityX = -5
            newPlayer.facingRight = false
          } else if (keys["ArrowRight"] || keys["KeyD"]) {
            newPlayer.velocityX = 5
            newPlayer.facingRight = true
          } else {
            newPlayer.velocityX *= 0.8
          }

          if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && newPlayer.onGround) {
            newPlayer.velocityY = -15
            newPlayer.onGround = false
          }
      }

      if (level.mechanic !== "flying" && level.mechanic !== "airplane") {
        newPlayer.velocityY += 0.8
      }

      newPlayer.x += newPlayer.velocityX
      newPlayer.y += newPlayer.velocityY

      if (newPlayer.x < 0) newPlayer.x = 0
      if (newPlayer.x + newPlayer.width > canvas.width) newPlayer.x = canvas.width - newPlayer.width

      if (newPlayer.y + newPlayer.height >= canvas.height - 50) {
        newPlayer.y = canvas.height - 50 - newPlayer.height
        newPlayer.velocityY = 0
        newPlayer.onGround = true
        if (level.mechanic === "fireworks") {
          setFireworksActive(false)
        }
      } else {
        newPlayer.onGround = false
      }

      levelObjects.forEach((obj) => {
        if (obj && obj.type === "platform" && checkCollision(newPlayer, obj)) {
          if (prevPlayer.y + prevPlayer.height <= obj.y + 5 && newPlayer.velocityY >= 0) {
            newPlayer.y = obj.y - newPlayer.height
            newPlayer.velocityY = 0
            newPlayer.onGround = true
            if (level.mechanic === "fireworks") {
              setFireworksActive(false)
            }
          }
        }
      })

      return newPlayer
    })

    // Check collectible collisions with proper error handling
    setLevelObjects((prevObjects) => {
      return prevObjects.map((obj, index) => {
        if (!obj || obj.type !== "collectible" || obj.collected) {
          return obj // Return the object as-is if it's not a collectible or already collected
        }

        // Update balloon positions for balloon popping level
        if (level.mechanic === "balloon_popping" && balloonPositions[index]) {
          obj.y = balloonPositions[index].y
        }

        if (checkCollision(player, obj)) {
          setCollectedItems((prev) => prev + 1)
          // Add floating hearts on collection
          for (let i = 0; i < 8; i++) {
            addFloatingHeart(obj.x + obj.width / 2 + (Math.random() - 0.5) * 30, obj.y + obj.height / 2)
          }
          for (let i = 0; i < 5; i++) {
            addParticle(obj.x + obj.width / 2, obj.y + obj.height / 2, "#DC143C")
          }
          return { ...obj, collected: true }
        }
        return obj
      })
    })

    // Check if level is completed - player must collect all items AND reach the end
    if (collectedItems >= level.collectibles && player.x > canvas.width - 100) {
      setGameState("levelComplete")
      setShowMessage(true)
      setCompletionAnimationTime(0)
      startHeartTransition()
    }
  }, [
    gameState,
    keys,
    player,
    levelObjects,
    currentLevel,
    collectedItems,
    levelTime,
    balloonPositions,
    suspicionClouds,
    fallingBombs,
    rhythmBeat,
    canMove,
    isFlying,
    fireworksActive,
    platformTimer,
    startHeartTransition,
    addFloatingHeart,
    updateFloatingHearts,
  ])

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 / 60)
    return () => clearInterval(interval)
  }, [gameLoop])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const level = levels[currentLevel]
    if (!level) return

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    if (level.backgroundColor.includes("linear-gradient")) {
      // Fixed regex pattern - using string methods instead
      const colorMatches = level.backgroundColor.match(/#[A-Fa-f0-9]{6}/g)
      const colors = colorMatches || ["#87CEEB", "#F0F8FF"]
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(1, colors[1] || colors[0])
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Enhanced weather rendering with more prominent effects
    weatherParticles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)

      if (particle.type === "snow") {
        // Larger, more visible snow
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.shadowColor = "white"
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(2, particle.size * 1.5), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else if (particle.type === "rain") {
        // More visible rain drops
        ctx.strokeStyle = `rgba(100, 149, 237, ${alpha})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, -particle.size * 2)
        ctx.lineTo(0, particle.size * 2)
        ctx.stroke()
      } else if (particle.type === "leaves") {
        // Autumn leaves
        ctx.fillStyle = `hsl(${20 + Math.random() * 40}, 80%, 50%)`
        ctx.shadowColor = "orange"
        ctx.shadowBlur = 5
        ctx.beginPath()
        ctx.ellipse(0, 0, particle.size * 1.2, particle.size * 0.8, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else if (particle.type === "petals") {
        // Draw petal shape
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.beginPath()
        ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (particle.type === "sparkles") {
        // Draw sparkle
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 5
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, particle.size), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else if (particle.type === "wind") {
        // Draw wind
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, particle.size), 0, Math.PI * 2)
        ctx.fill()
      } else if (particle.type === "heavy_snow") {
        // Draw heavy snow
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, particle.size), 0, Math.PI * 2)
        ctx.fill()
      } else if (particle.type === "melting_snow") {
        // Draw melting snow
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, particle.size), 0, Math.PI * 2)
        ctx.fill()
      } else if (particle.type === "spring_bloom") {
        // Draw spring bloom
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, particle.size), 0, Math.PI * 2)
        ctx.fill()
      } else if (particle.type === "butterflies") {
        // Draw butterflies
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`)
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, particle.size), 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })

    // Enhanced level-specific background effects
    switch (level.mechanic) {
      case "balloon_popping":
        // Animated party lights with more effects
        for (let i = 0; i < 15; i++) {
          const hue = (animationTime + i * 24) % 360
          const brightness = 0.4 + 0.4 * Math.sin(animationTime * 0.08 + i)
          const size = 6 + 4 * Math.sin(animationTime * 0.1 + i)
          ctx.fillStyle = `hsl(${hue}, 80%, ${brightness * 100}%)`
          ctx.shadowColor = `hsl(${hue}, 80%, 70%)`
          ctx.shadowBlur = 15
          ctx.beginPath()
          ctx.arc(i * 53 + 40, 40 + Math.sin(animationTime * 0.06 + i) * 8, Math.max(1, size), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        // Confetti
        for (let i = 0; i < 30; i++) {
          const x = (animationTime * 3 + i * 27) % (canvas.width + 20)
          const y = (animationTime * 2 + i * 31) % (canvas.height + 20)
          ctx.fillStyle = `hsl(${(i * 30) % 360}, 70%, 60%)`
          ctx.fillRect(x, y, 4, 4)
        }
        break

      case "stealth":
        // Enhanced twinkling stars
        for (let i = 0; i < 40; i++) {
          const twinkle = 0.2 + 0.8 * Math.abs(Math.sin(animationTime * 0.04 + i))
          const size = 1 + Math.sin(animationTime * 0.06 + i) * 1
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`
          ctx.shadowColor = "white"
          ctx.shadowBlur = 5
          ctx.beginPath()
          ctx.arc((i * 37) % canvas.width, (i * 23) % 300, Math.max(1, size), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        // Shooting stars
        if (animationTime % 200 < 50) {
          const progress = (animationTime % 200) / 50
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(progress * canvas.width, progress * 100)
          ctx.lineTo(progress * canvas.width - 30, progress * 100 - 10)
          ctx.stroke()
        }
        break

      case "dodge_falling":
        // Enhanced storm effects
        const stormIntensity = 0.03 + 0.07 * Math.sin(animationTime * 0.15)
        ctx.fillStyle = `rgba(255, 0, 0, ${stormIntensity})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // Lightning effect
        if (animationTime % 120 < 5) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        break

      case "ice_physics":
        // Enhanced snowfall with wind
        for (let i = 0; i < 80; i++) {
          const windOffset = Math.sin(animationTime * 0.02 + i) * 20
          const x = ((animationTime * 2 + i * 16 + windOffset) % (canvas.width + 40)) - 20
          const y = ((animationTime * 3 + i * 23) % (canvas.height + 40)) - 20
          const size = 1 + Math.sin(animationTime * 0.08 + i) * 2
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
          ctx.shadowColor = "white"
          ctx.shadowBlur = 3
          ctx.beginPath()
          ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        break

      case "rhythm":
        // Enhanced beat indicator with stage lights
        const beatSize = rhythmBeat ? 35 + Math.sin(animationTime * 0.4) * 8 : 25
        const beatColor = rhythmBeat ? "#FFD700" : "#444"

        // Stage lights
        for (let i = 0; i < 5; i++) {
          const lightIntensity = rhythmBeat ? 0.3 + 0.2 * Math.sin(animationTime * 0.3 + i) : 0.1
          ctx.fillStyle = `rgba(255, 215, 0, ${lightIntensity})`
          ctx.beginPath()
          ctx.arc(i * 160 + 80, 80, Math.max(1, 40), 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = beatColor
        ctx.shadowColor = rhythmBeat ? "#FFD700" : "transparent"
        ctx.shadowBlur = rhythmBeat ? 25 : 0
        ctx.beginPath()
        ctx.arc(canvas.width - 50, 50, Math.max(1, beatSize), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.fillStyle = level.textColor
        ctx.font = "bold 14px Arial"
        ctx.fillText(canMove ? "MOVE!" : "WAIT", canvas.width - 75, 55)
        break

      case "flying":
        // Enhanced wind effects with clouds
        for (let i = 0; i < 15; i++) {
          const alpha = 0.15 + 0.15 * Math.sin(animationTime * 0.08 + i)
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.lineWidth = 3
          const x = (animationTime * 4 + i * 60) % (canvas.width + 60)
          ctx.beginPath()
          ctx.moveTo(x, i * 40 + 80)
          ctx.lineTo(x + 50, i * 40 + 80)
          ctx.stroke()
        }
        // Floating hearts
        for (let i = 0; i < 8; i++) {
          const x = (animationTime * 2 + i * 100) % (canvas.width + 50)
          const y = 150 + Math.sin(animationTime * 0.03 + i) * 30
          const size = 8 + Math.sin(animationTime * 0.1 + i) * 3
          ctx.fillStyle = "rgba(255, 105, 180, 0.6)"
          ctx.font = `${size}px Arial`
          ctx.fillText("♥", x, y)
        }
        break

      case "airplane":
        // Enhanced clouds with depth
        for (let i = 0; i < 8; i++) {
          const x = ((canvas.width + animationTime * 2 + i * 150) % (canvas.width + 120)) - 60
          const y = 80 + i * 60 + Math.sin(animationTime * 0.04 + i) * 15
          const alpha = 0.4 + 0.3 * Math.sin(animationTime * 0.08 + i)
          const size = 25 + Math.sin(animationTime * 0.06 + i) * 10
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2)
          ctx.arc(x + size * 0.8, y, Math.max(1, size * 1.2), 0, Math.PI * 2)
          ctx.arc(x + size * 1.6, y, Math.max(1, size), 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "fireworks":
        // Enhanced fireworks (reduced for July)
        const fireworkCount = level.month === "July" ? 3 : 8
        if (fireworksActive || animationTime % 60 < 30) {
          for (let i = 0; i < fireworkCount; i++) {
            const x = (i * 100 + 50) % canvas.width
            const y = 50 + Math.random() * 200
            const hue = (animationTime + i * 45) % 360
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
            ctx.shadowColor = `hsl(${hue}, 80%, 60%)`
            ctx.shadowBlur = 20
            const lineCount = level.month === "July" ? 6 : 12
            const length = 30
            for (let j = 0; j < lineCount; j++) {
              const angle = (j / lineCount) * Math.PI * 2
              ctx.beginPath()
              ctx.moveTo(x, y)
              ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
              ctx.lineWidth = 4
              ctx.stroke()
            }
            ctx.shadowBlur = 0
          }
        }
        break
    }

    // Universal romantic floating hearts
    if (levelTime % 120 === 0) {
      for (let i = 0; i < 3; i++) {
        addBackgroundParticle(
          Math.random() * canvas.width,
          canvas.height + 10,
          "#FFB6C1",
          (Math.random() - 0.5) * 2,
          -1 - Math.random() * 2,
        )
      }
    }

    // Romantic sparkles
    for (let i = 0; i < 8; i++) {
      const sparkleX = (animationTime * 0.5 + i * 100) % (canvas.width + 50)
      const sparkleY = 50 + Math.sin(animationTime * 0.03 + i) * 40
      const sparkleAlpha = 0.3 + 0.7 * Math.abs(Math.sin(animationTime * 0.08 + i))

      ctx.fillStyle = `rgba(255, 215, 0, ${sparkleAlpha})`
      ctx.shadowColor = "gold"
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(sparkleX, sparkleY, Math.max(1, 2 + Math.sin(animationTime * 0.1 + i) * 1), 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Cross sparkle effect
      ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleAlpha})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sparkleX - 4, sparkleY)
      ctx.lineTo(sparkleX + 4, sparkleY)
      ctx.moveTo(sparkleX, sparkleY - 4)
      ctx.lineTo(sparkleX, sparkleY + 4)
      ctx.stroke()
    }

    // Floating love messages
    const loveMessages = ["♥", "★", "✨", "💕"]
    for (let i = 0; i < 4; i++) {
      const msgX = (animationTime * 1.5 + i * 200) % (canvas.width + 100)
      const msgY = 100 + Math.sin(animationTime * 0.04 + i) * 50
      const msgAlpha = 0.4 + 0.4 * Math.sin(animationTime * 0.06 + i)

      ctx.fillStyle = `rgba(255, 105, 180, ${msgAlpha})`
      ctx.font = `${16 + Math.sin(animationTime * 0.08 + i) * 4}px Arial`
      ctx.shadowColor = "rgba(255, 105, 180, 0.8)"
      ctx.shadowBlur = 10
      ctx.fillText(loveMessages[i], msgX, msgY)
      ctx.shadowBlur = 0
    }

    // Draw background particles
    backgroundParticles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      ctx.fillStyle = particle.color.includes("rgba")
        ? particle.color
        : particle.color.includes("hsl")
          ? particle.color.replace(")", `, ${alpha})`)
          : `${particle.color}${Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0")}`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, Math.max(0.5, particle.size * alpha), 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw level-specific special objects with enhanced animations
    switch (level.mechanic) {
      case "stealth":
        suspicionClouds.forEach((cloud) => {
          const size = 35 + Math.sin(animationTime * 0.08) * 8
          const pulseIntensity = cloud.looking ? 0.7 + 0.3 * Math.sin(animationTime * 0.5) : 0.4
          ctx.fillStyle = cloud.looking ? `rgba(255, 0, 0, ${pulseIntensity})` : "rgba(200, 200, 200, 0.6)"
          ctx.shadowColor = cloud.looking ? "red" : "transparent"
          ctx.shadowBlur = cloud.looking ? 15 : 0
          ctx.beginPath()
          ctx.arc(cloud.x, 300, Math.max(1, size), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          if (cloud.looking) {
            const eyeSize = 4 + Math.sin(animationTime * 0.3) * 2
            ctx.fillStyle = "#FF0000"
            ctx.shadowColor = "red"
            ctx.shadowBlur = 10
            ctx.beginPath()
            ctx.arc(cloud.x - 12, 290, Math.max(1, eyeSize), 0, Math.PI * 2)
            ctx.arc(cloud.x + 12, 290, Math.max(1, eyeSize), 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        })
        break

      case "dodge_falling":
        fallingBombs.forEach((bomb) => {
          const size = 10 + Math.sin(animationTime * 0.4) * 3
          ctx.fillStyle = "#FF0000"
          ctx.shadowColor = "red"
          ctx.shadowBlur = 15
          ctx.beginPath()
          ctx.arc(bomb.x, bomb.y, Math.max(1, size), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          // Enhanced fuse
          ctx.strokeStyle = "#FFD700"
          ctx.lineWidth = 3
          ctx.shadowColor = "yellow"
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.moveTo(bomb.x, bomb.y - size)
          ctx.lineTo(bomb.x - 8, bomb.y - 25 - Math.sin(animationTime * 0.6) * 4)
          ctx.stroke()
          ctx.shadowBlur = 0
        })
        break

      case "time_pressure":
        const timeLeft = Math.max(0, 300 - platformTimer)
        const urgency = timeLeft < 60 ? 1 : 0
        const timerAlpha = urgency ? 0.6 + 0.4 * Math.sin(animationTime * 0.6) : 1
        ctx.fillStyle = urgency ? `rgba(255, 0, 0, ${timerAlpha})` : level.textColor
        ctx.font = "bold 24px Arial"
        ctx.shadowColor = urgency ? "red" : "transparent"
        ctx.shadowBlur = urgency ? 10 : 0
        ctx.fillText(`Time: ${Math.ceil(timeLeft / 60)}`, canvas.width - 120, 30)
        ctx.shadowBlur = 0
        break
    }

    // Draw particles
    particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      ctx.fillStyle = particle.color.includes("rgba")
        ? particle.color
        : particle.color.includes("hsl")
          ? particle.color.replace(")", `, ${alpha})`)
          : `${particle.color}${Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0")}`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, Math.max(0.5, particle.size * alpha), 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw level objects with enhanced animations
    levelObjects.forEach((obj, index) => {
      if (!obj || (obj.type === "collectible" && obj.collected)) return

      ctx.fillStyle = obj.color || "#666"

      if (obj.type === "collectible") {
        if (level.mechanic === "balloon_popping" && balloonPositions[index]) {
          obj.y = balloonPositions[index].y
        }

        // Enhanced collectible with golden border and better visibility
        const floatOffset = Math.sin(animationTime * 0.08 + index) * 4
        const heartX = obj.x + obj.width / 2
        const heartY = obj.y + obj.height / 2 + floatOffset
        const heartSize = 16 + Math.sin(animationTime * 0.15 + index) * 4

        // Golden border/glow effect
        ctx.shadowColor = "#FFD700"
        ctx.shadowBlur = 20 + Math.sin(animationTime * 0.12 + index) * 10

        // Outer golden glow
        ctx.fillStyle = "#FFD700"
        ctx.font = `${heartSize + 4}px Arial`
        ctx.fillText("♥", heartX - (heartSize + 4) / 2, heartY + (heartSize + 4) / 3)

        // Inner heart
        ctx.fillStyle = "#DC143C"
        ctx.font = `${heartSize}px Arial`
        ctx.fillText("♥", heartX - heartSize / 2, heartY + heartSize / 3)
        ctx.shadowBlur = 0

        // Add sparkle effect around collectibles
        if (animationTime % 30 < 15) {
          for (let i = 0; i < 4; i++) {
            const sparkleAngle = animationTime * 0.1 + (i * Math.PI) / 2
            const sparkleX = heartX + Math.cos(sparkleAngle) * 20
            const sparkleY = heartY + Math.sin(sparkleAngle) * 20
            ctx.fillStyle = "white"
            ctx.shadowColor = "white"
            ctx.shadowBlur = 5
            ctx.beginPath()
            ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      } else if (obj.type === "obstacle") {
        const pulseSize = 1 + Math.sin(animationTime * 0.08 + index) * 0.15
        ctx.shadowColor = obj.color
        ctx.shadowBlur = 5
        ctx.beginPath()
        ctx.roundRect(
          obj.x - (obj.width * (pulseSize - 1)) / 2,
          obj.y - (obj.height * (pulseSize - 1)) / 2,
          obj.width * pulseSize,
          obj.height * pulseSize,
          8,
        )
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        if (level.mechanic === "ice_physics") {
          const iceGradient = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.height)
          const shimmer = 0.7 + 0.3 * Math.sin(animationTime * 0.08 + index)
          iceGradient.addColorStop(0, `rgba(240, 255, 255, ${shimmer})`)
          iceGradient.addColorStop(0.5, "#E0FFFF")
          iceGradient.addColorStop(1, `rgba(224, 255, 255, ${shimmer * 0.8})`)
          ctx.fillStyle = iceGradient
          ctx.shadowColor = "cyan"
          ctx.shadowBlur = 8
        }
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
        ctx.shadowBlur = 0
      }
    })

    // Draw player with enhanced animations and expressions
    const playerBob = Math.sin(animationTime * 0.15) * 3
    const playerScale = 1 + Math.sin(animationTime * 0.1) * 0.05

    if (level.mechanic === "airplane") {
      // Enhanced airplane with trail - Kashmiri boy pilot
      ctx.fillStyle = "#D2B48C" // Light brown skin
      ctx.shadowColor = "#D2B48C"
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height / 2 + playerBob,
        (player.width / 2) * playerScale,
        (player.height / 4) * playerScale,
        Math.sin(animationTime * 0.08) * 0.15,
        0,
        Math.PI * 2,
      )
      ctx.fill()
      ctx.shadowBlur = 0

      // Traditional cap visible even in airplane mode
      ctx.fillStyle = "#654321"
      ctx.fillRect(player.x + 3, player.y - 5 + playerBob, player.width - 6, 8)

      // Enhanced wings with flapping
      const wingFlap = Math.sin(animationTime * 0.4) * 3
      ctx.fillStyle = "#87CEEB"
      ctx.fillRect(player.x - 12, player.y + player.height / 2 - 3 + wingFlap + playerBob, player.width + 24, 6)
    } else if (isFlying) {
      // Enhanced flying character - Kashmiri teen boy
      // Body with light brown skin
      ctx.fillStyle = "#D2B48C" // Light brown skin tone
      ctx.shadowColor = "#D2B48C"
      ctx.shadowBlur = 8
      ctx.fillRect(player.x, player.y + playerBob, player.width * playerScale, player.height * playerScale)
      ctx.shadowBlur = 0

      // Traditional Kashmiri clothing (kurta)
      ctx.fillStyle = "#8B4513" // Brown kurta
      ctx.fillRect(player.x + 2, player.y + 15 + playerBob, player.width - 4, player.height - 20)

      // Traditional embroidery pattern on kurta
      ctx.fillStyle = "#DAA520" // Golden thread
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(player.x + 4 + i * 6, player.y + 18 + playerBob, 2, 1)
        ctx.fillRect(player.x + 4 + i * 6, player.y + 22 + playerBob, 2, 1)
      }

      // Traditional cap (topi)
      ctx.fillStyle = "#654321" // Dark brown cap
      ctx.fillRect(player.x + 3, player.y + 2 + playerBob, player.width - 6, 8)
      // Cap pattern
      ctx.fillStyle = "#DAA520"
      ctx.fillRect(player.x + 8, player.y + 4 + playerBob, 14, 1)

      // Enhanced animated wings
      const wingFlap = Math.sin(animationTime * 0.5) * 0.4
      ctx.fillStyle = "#FFB6C1"
      ctx.shadowColor = "#FFB6C1"
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.ellipse(player.x - 8, player.y + 12 + playerBob, 10, 18, -0.4 + wingFlap, 0, Math.PI * 2)
      ctx.ellipse(player.x + player.width + 8, player.y + 12 + playerBob, 10, 18, 0.4 - wingFlap, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    } else {
      // Enhanced normal player - Kashmiri teen boy
      // Body with light brown skin
      ctx.fillStyle = "#D2B48C" // Light brown skin tone
      ctx.shadowColor = "#D2B48C"
      ctx.shadowBlur = 8
      ctx.fillRect(player.x, player.y + playerBob, player.width * playerScale, player.height * playerScale)
      ctx.shadowBlur = 0

      // Traditional Kashmiri clothing (kurta)
      ctx.fillStyle = "#8B4513" // Brown kurta/shirt
      ctx.fillRect(player.x + 2, player.y + 15 + playerBob, player.width - 4, player.height - 20)

      // Traditional embroidery pattern on kurta
      ctx.fillStyle = "#DAA520" // Golden thread embroidery
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(player.x + 4 + i * 6, player.y + 18 + playerBob, 2, 1)
        ctx.fillRect(player.x + 4 + i * 6, player.y + 22 + playerBob, 2, 1)
      }

      // Traditional cap (topi) - iconic Kashmiri headwear
      ctx.fillStyle = "#654321" // Dark brown cap
      ctx.fillRect(player.x + 3, player.y + 2 + playerBob, player.width - 6, 8)
      // Traditional pattern on cap
      ctx.fillStyle = "#DAA520" // Golden pattern
      ctx.fillRect(player.x + 8, player.y + 4 + playerBob, 14, 1)

      // Traditional pants (salwar)
      ctx.fillStyle = "#696969" // Gray traditional pants
      ctx.fillRect(player.x + 4, player.y + 32 + playerBob, player.width - 8, 8)
    }

    // Enhanced animated face with Kashmiri features
    ctx.fillStyle = "#000"
    const eyeBlink = Math.sin(animationTime * 0.03) > 0.97 ? 1 : 4
    const eyeSpacing = player.facingRight ? 0 : 2

    // Slightly larger, expressive almond-shaped eyes (characteristic of Kashmiri features)
    ctx.fillStyle = "#FFFFFF" // Eye whites
    ctx.fillRect(player.x + 4 + eyeSpacing, player.y + 7 + playerBob, 6, 5)
    ctx.fillRect(player.x + 19 - eyeSpacing, player.y + 7 + playerBob, 6, 5)

    // Dark brown iris
    ctx.fillStyle = "#2F1B14"
    ctx.fillRect(player.x + 5 + eyeSpacing, player.y + 8 + playerBob, 4, eyeBlink)
    ctx.fillRect(player.x + 20 - eyeSpacing, player.y + 8 + playerBob, 4, eyeBlink)

    // Eyebrows (slightly thicker, characteristic feature)
    ctx.fillStyle = "#2F1B14"
    ctx.fillRect(player.x + 4 + eyeSpacing, player.y + 6 + playerBob, 7, 1)
    ctx.fillRect(player.x + 18 - eyeSpacing, player.y + 6 + playerBob, 7, 1)

    // Nose (small line)
    ctx.fillRect(player.x + 14, player.y + 12 + playerBob, 1, 3)

    // Dynamic smile based on game state
    const smileWidth = 10 + Math.sin(animationTime * 0.08) * 4
    const smileY = collectedItems > 0 ? player.y + 18 + playerBob : player.y + 20 + playerBob
    ctx.fillRect(player.x + 15 - smileWidth / 2, smileY, smileWidth, 2)

    // Hair (dark brown, slightly wavy - typical Kashmiri hair)
    ctx.fillStyle = "#2F1B14" // Dark brown hair
    ctx.fillRect(player.x + 1, player.y + 1 + playerBob, player.width - 2, 6)
    // Hair texture with slight waves
    for (let i = 0; i < 4; i++) {
      const waveOffset = Math.sin(animationTime * 0.1 + i) * 1
      ctx.fillRect(player.x + 2 + i * 6, player.y + playerBob + waveOffset, 3, 4)
    }

    // Add a small traditional tilaka/mark on forehead (optional cultural element)
    if (levelTime % 300 < 150) {
      // Appears periodically
      ctx.fillStyle = "#DC143C" // Red tilaka
      ctx.fillRect(player.x + 14, player.y + 5 + playerBob, 2, 2)
    }

    // Draw enhanced animated UI with better text contrast
    ctx.fillStyle = level.textColor
    ctx.font = "bold 22px Arial"
    ctx.strokeStyle = level.textColor === "#FFFFFF" ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)"
    ctx.lineWidth = 3
    const titleY = 35 + Math.sin(animationTime * 0.08) * 3
    ctx.strokeText(`${level.month}: ${level.title}`, 25, titleY)
    ctx.fillText(`${level.month}: ${level.title}`, 25, titleY)

    const heartsY = 65 + Math.sin(animationTime * 0.12) * 3
    ctx.strokeText(`Hearts: ${collectedItems}/${level.collectibles}`, 25, heartsY)
    ctx.fillText(`Hearts: ${collectedItems}/${level.collectibles}`, 25, heartsY)
    ctx.shadowBlur = 0

    // Level-specific enhanced UI
    if (level.mechanic === "stealth") {
      const hidden = suspicionClouds.some((cloud) => Math.abs(cloud.x - player.x) < 60 && cloud.looking)
      if (hidden) {
        const alertAlpha = 0.6 + 0.4 * Math.sin(animationTime * 0.8)
        ctx.fillStyle = `rgba(255, 0, 0, ${alertAlpha})`
        ctx.font = "bold 18px Arial"
        ctx.shadowColor = "red"
        ctx.shadowBlur = 15
        ctx.fillText("SPOTTED!", 25, 95)
        ctx.shadowBlur = 0
      }
    }

    // Progress indicator
    const progress = (collectedItems / level.collectibles) * 100
    ctx.fillStyle = "rgba(0,0,0,0.3)"
    ctx.fillRect(canvas.width - 220, 20, 200, 20)
    ctx.fillStyle = `hsl(${progress * 1.2}, 70%, 50%)`
    ctx.fillRect(canvas.width - 218, 22, (progress / 100) * 196, 16)
    ctx.fillStyle = level.textColor
    ctx.font = "12px Arial"
    ctx.shadowColor = "rgba(0,0,0,0.8)"
    ctx.shadowBlur = 2
    ctx.fillText(`Progress: ${Math.round(progress)}%`, canvas.width - 210, 33)
    ctx.shadowBlur = 0

    // Draw heart transition effect
    if (transitionState === "heartWipe") {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)
      const currentRadius = maxRadius * transitionProgress

      // Create heart-shaped mask
      ctx.save()
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = "rgba(255, 105, 180, 0.8)"

      // Draw expanding heart shape
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const heartRadius = currentRadius * (0.5 + 0.3 * Math.sin(angle * 3))
        const x = centerX + heartRadius * Math.cos(angle)
        const y = centerY + heartRadius * Math.sin(angle)

        ctx.beginPath()
        ctx.arc(x, y, 20 * transitionProgress, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    // Draw floating hearts
    floatingHearts.forEach((heart) => {
      const alpha = heart.life / heart.maxLife
      ctx.save()
      ctx.translate(heart.x, heart.y)
      ctx.scale(heart.size / 20, heart.size / 20)
      ctx.fillStyle = `rgba(255, 105, 180, ${alpha})`
      ctx.shadowColor = "rgba(255, 105, 180, 0.8)"
      ctx.shadowBlur = 10
      ctx.font = "20px Arial"
      ctx.fillText("♥", -10, 10)
      ctx.shadowBlur = 0
      ctx.restore()
    })
  }, [
    player,
    levelObjects,
    currentLevel,
    collectedItems,
    levelTime,
    balloonPositions,
    suspicionClouds,
    fallingBombs,
    rhythmBeat,
    canMove,
    isFlying,
    fireworksActive,
    platformTimer,
    particles,
    backgroundParticles,
    weatherParticles,
    animationTime,
    transitionState,
    transitionProgress,
    floatingHearts,
  ])

  useEffect(() => {
    if (gameState === "playing") {
      const animationFrame = requestAnimationFrame(draw)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [draw, gameState])

  const startGame = () => {
    setCurrentLevel(0)
    setGameState("playing")
    // Ensure audio starts playing
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(console.log)
    }
  }

  const nextLevel = () => {
    console.log(`Completing level ${currentLevel + 1} (${levels[currentLevel]?.month})`)
    if (currentLevel < levels.length - 1) {
      const nextLevelIndex = currentLevel + 1
      console.log(`Moving to level ${nextLevelIndex + 1} (${levels[nextLevelIndex]?.month})`)
      setCurrentLevel(nextLevelIndex)
      setGameState("playing")
    } else {
      console.log("All levels completed, showing graffiti wall")
      setGameState("graffitiWall")
    }
  }

  const restartGame = () => {
    setCurrentLevel(0)
    setGameState("menu")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  useEffect(() => {
    if (gameState === "levelComplete" || gameState === "gameComplete") {
      const heartInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
          addFloatingHeart(Math.random() * 800, 600 + Math.random() * 50)
        }
      }, 200)

      return () => clearInterval(heartInterval)
    }
  }, [gameState, addFloatingHeart])

  // Render month-specific completion animations
  const renderCompletionAnimations = (level: Level, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const theme = level.completionTheme
    const time = completionAnimationTime

    switch (level.month) {
      case "August":
        // Floating translucent hearts
        for (let i = 0; i < 12; i++) {
          const heartX = 100 + i * 60 + Math.sin(time * 0.02 + i) * 30
          const heartY = 200 + Math.sin(time * 0.03 + i) * 50
          const alpha = 0.3 + 0.4 * Math.sin(time * 0.04 + i)
          ctx.fillStyle = `rgba(255, 105, 180, ${alpha})`
          ctx.font = `${20 + Math.sin(time * 0.05 + i) * 5}px Arial`
          ctx.fillText("♥", heartX, heartY)
        }

        // Raindrop ripples
        for (let i = 0; i < 8; i++) {
          const rippleX = (time * 2 + i * 100) % canvas.width
          const rippleY = canvas.height - 100
          const rippleSize = (time * 0.5 + i * 20) % 50
          ctx.strokeStyle = `rgba(173, 216, 230, ${1 - rippleSize / 50})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(rippleX, rippleY, rippleSize, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Chat bubbles
        if (time > 60) {
          const bubble1Alpha = Math.min(1, (time - 60) / 60)
          ctx.fillStyle = `rgba(255, 255, 255, ${bubble1Alpha})`
          ctx.beginPath()
          ctx.roundRect(150, 300, 120, 60, 20)
          ctx.fill()
          ctx.fillStyle = "#2C1810" // Dark brown for contrast
          ctx.font = "14px Arial"
          ctx.fillText("Hey...", 170, 335)
        }

        if (time > 120) {
          const bubble2Alpha = Math.min(1, (time - 120) / 60)
          ctx.fillStyle = `rgba(255, 255, 255, ${bubble2Alpha})`
          ctx.beginPath()
          ctx.roundRect(450, 320, 140, 60, 20)
          ctx.fill()
          ctx.fillStyle = "#2C1810" // Dark brown for contrast
          ctx.font = "14px Arial"
          ctx.fillText("I love you", 470, 355)
        }
        break

      case "September":
        // Soft streamers
        for (let i = 0; i < 6; i++) {
          const streamerX = i * 130 + 50
          const streamerY = Math.sin(time * 0.02 + i) * 20
          ctx.strokeStyle = `hsl(${i * 60}, 70%, 60%)`
          ctx.lineWidth = 8
          ctx.beginPath()
          ctx.moveTo(streamerX, streamerY)
          ctx.lineTo(streamerX + 20, streamerY + 200)
          ctx.stroke()
        }

        // Music notes floating
        const musicNotes = ["♪", "♫", "♬"]
        for (let i = 0; i < 8; i++) {
          const noteX = (time * 1.5 + i * 100) % (canvas.width + 50)
          const noteY = 150 + Math.sin(time * 0.03 + i) * 30
          ctx.fillStyle = theme.accentColor
          ctx.font = `${16 + Math.sin(time * 0.04 + i) * 4}px Arial`
          ctx.fillText(musicNotes[i % 3], noteX, noteY)
        }

        // Candle flicker
        const candleFlicker = 1 + Math.sin(time * 0.3) * 0.2
        ctx.fillStyle = "#FFD700"
        ctx.shadowColor = "#FFA500"
        ctx.shadowBlur = 15 * candleFlicker
        ctx.beginPath()
        ctx.ellipse(canvas.width / 2, 250, 8, 12 * candleFlicker, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Sleeping avatar
        ctx.fillStyle = "#2C1810" // Dark brown for contrast
        ctx.beginPath()
        ctx.arc(600, 400, 30, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#000"
        ctx.font = "12px Arial"
        ctx.fillText("zzz", 620, 380)
        break

      case "October":
        // Shooting stars
        for (let i = 0; i < 3; i++) {
          const starProgress = ((time + i * 100) % 300) / 300
          const starX = starProgress * canvas.width
          const starY = 50 + i * 30
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - starProgress})`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(starX, starY)
          ctx.lineTo(starX - 30, starY - 10)
          ctx.stroke()
        }

        // Moving clouds revealing constellations
        const cloudX = ((time * 0.5) % (canvas.width + 100)) - 50
        ctx.fillStyle = "rgba(200, 200, 200, 0.7)"
        ctx.beginPath()
        ctx.arc(cloudX, 100, 40, 0, Math.PI * 2)
        ctx.arc(cloudX + 30, 100, 50, 0, Math.PI * 2)
        ctx.fill()

        // Constellation behind clouds
        if (cloudX > 200 && cloudX < 400) {
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = "#FFFFFF"
            ctx.beginPath()
            ctx.arc(300 + i * 20, 80 + i * 10, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Ring exchange silhouettes
        if (time > 180) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
          ctx.beginPath()
          ctx.arc(350, 450, 25, 0, Math.PI * 2)
          ctx.arc(450, 450, 25, 0, Math.PI * 2)
          ctx.fill()

          // Ring sparkle
          ctx.fillStyle = theme.accentColor
          ctx.beginPath()
          ctx.arc(400, 440, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "November":
        // Red/purple glow pulses
        const glowIntensity = 0.3 + 0.4 * Math.sin(time * 0.1)
        ctx.fillStyle = `rgba(139, 0, 0, ${glowIntensity})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Crackling static
        if (time % 60 < 10) {
          for (let i = 0; i < 20; i++) {
            const staticX = Math.random() * canvas.width
            const staticY = Math.random() * canvas.height
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`
            ctx.fillRect(staticX, staticY, 2, 2)
          }
        }

        // Spinning heart + flame
        const spinAngle = time * 0.05
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(spinAngle)
        ctx.fillStyle = "#DC143C"
        ctx.font = "40px Arial"
        ctx.fillText("♥", -20, 10)
        ctx.fillStyle = "#FF4500"
        ctx.font = "30px Arial"
        ctx.fillText("🔥", 20, -10)
        ctx.restore()

        // Argument text fading
        const argumentTexts = ["But...", "I just...", "Why?", "Sorry..."]
        for (let i = 0; i < argumentTexts.length; i++) {
          const textAlpha = Math.max(0, Math.sin(time * 0.02 + i) * 0.5 + 0.3)
          ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`
          ctx.font = "16px Arial"
          ctx.fillText(argumentTexts[i], 100 + i * 150, 500)
        }
        break

      case "December":
        // Fog on window
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fillRect(50, 50, 300, 200)

        // Finger writing name with high contrast
        if (time > 60) {
          const nameProgress = Math.min(1, (time - 60) / 120)
          ctx.strokeStyle = "rgba(20, 20, 20, 0.9)" // Much darker for contrast
          ctx.lineWidth = 4
          ctx.font = "24px cursive"
          ctx.strokeText("Ansu", 150, 150)
          if (nameProgress > 0.5) {
            ctx.fillStyle = "rgba(40, 40, 40, 0.8)" // Dark gray for visibility
            ctx.fillText("Ansu", 150, 150)
          }
        }

        // Lonely figure with high contrast
        ctx.fillStyle = "#1a1a2e" // Dark navy for visibility against blue background
        ctx.beginPath()
        ctx.arc(500, 400, 30, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillRect(485, 430, 30, 50)

        // Glowing phone
        const phoneGlow = 0.5 + 0.5 * Math.sin(time * 0.2)
        ctx.fillStyle = `rgba(0, 100, 255, ${phoneGlow})`
        ctx.shadowColor = "rgba(0, 100, 255, 0.8)"
        ctx.shadowBlur = 20
        ctx.fillRect(450, 500, 60, 30)
        ctx.shadowBlur = 0

        // Unread messages pulsing
        ctx.fillStyle = "#FF0000"
        ctx.beginPath()
        ctx.arc(490, 510, 5 + Math.sin(time * 0.3) * 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "10px Arial"
        ctx.fillText("3", 487, 513)
        break

      case "January":
        // Concert crowd silhouettes with better contrast
        for (let i = 0; i < 20; i++) {
          const crowdX = i * 40
          const crowdY = 450 + Math.sin(time * 0.1 + i) * 20
          const crowdHeight = 50 + Math.sin(time * 0.05 + i) * 30
          ctx.fillStyle = "rgba(0, 0, 0, 0.9)" // Darker for better visibility
          ctx.fillRect(crowdX, crowdY, 20, crowdHeight)
        }

        // Spotlight sweeping
        const spotlightAngle = (time * 0.02) % (Math.PI * 2)
        const spotlightX = canvas.width / 2 + Math.cos(spotlightAngle) * 200
        const spotlightY = 300
        const gradient = ctx.createRadialGradient(spotlightX, spotlightY, 0, spotlightX, spotlightY, 100)
        gradient.addColorStop(0, "rgba(255, 255, 0, 0.5)")
        gradient.addColorStop(1, "rgba(255, 255, 0, 0)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Empty space pause with high contrast
        if (Math.abs(spotlightX - canvas.width / 2) < 50) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)" // More opaque white
          ctx.strokeStyle = "rgba(0, 0, 0, 0.8)" // Dark border for definition
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(canvas.width / 2, 300, 30, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }

        // Birthday card floating with better contrast
        const cardY = 200 + Math.sin(time * 0.03) * 20
        ctx.fillStyle = "#FFB6C1"
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)" // Subtle border
        ctx.lineWidth = 1
        ctx.fillRect(300, cardY, 80, 60)
        ctx.strokeRect(300, cardY, 80, 60)
        ctx.fillStyle = "#2c1810" // Dark brown for high contrast
        ctx.font = "bold 12px Arial"
        ctx.fillText("Happy", 315, cardY + 25)
        ctx.fillText("Birthday!", 310, cardY + 40)

        // Distant fireworks
        if (time % 120 < 20) {
          for (let i = 0; i < 3; i++) {
            const fwX = 100 + i * 200
            const fwY = 100
            ctx.strokeStyle = `hsl(${i * 120}, 80%, 50%)` // More saturated for visibility
            ctx.lineWidth = 3 // Thicker lines
            for (let j = 0; j < 8; j++) {
              const angle = (j / 8) * Math.PI * 2
              ctx.beginPath()
              ctx.moveTo(fwX, fwY)
              ctx.lineTo(fwX + Math.cos(angle) * 20, fwY + Math.sin(angle) * 20)
              ctx.stroke()
            }
          }
        }
        break

      case "March":
        // Ticking clock with high contrast
        const clockAngle = (time * 0.1) % (Math.PI * 2)
        ctx.strokeStyle = "#1a1a2e" // Dark navy for visibility
        ctx.lineWidth = 4 // Thicker for better visibility
        ctx.beginPath()
        ctx.arc(100, 100, 40, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(100, 100)
        ctx.lineTo(100 + Math.cos(clockAngle - Math.PI / 2) * 30, 100 + Math.sin(clockAngle - Math.PI / 2) * 30)
        ctx.stroke()

        // Falling sticky notes with better contrast
        for (let i = 0; i < 8; i++) {
          const noteY = ((time * 2 + i * 50) % (canvas.height + 100)) - 50
          const noteX = 200 + i * 70
          ctx.fillStyle = `hsl(${60 + i * 30}, 80%, 75%)` // Lighter background
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)" // Subtle border
          ctx.lineWidth = 1
          ctx.fillRect(noteX, noteY, 40, 40)
          ctx.strokeRect(noteX, noteY, 40, 40)
          ctx.fillStyle = "#2c1810" // Dark text for readability
          ctx.font = "bold 10px Arial"
          ctx.fillText("E=mc²", noteX + 5, noteY + 20)
        }

        // Blooming flowers with better visibility
        for (let i = 0; i < 5; i++) {
          const flowerSize = Math.max(0, Math.sin(time * 0.02 + i) * 15)
          ctx.fillStyle = `hsl(${300 + i * 20}, 80%, 60%)` // More saturated
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)" // Dark outline
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(500 + i * 50, 450, flowerSize, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }

        // Encouragement messages with high contrast
        const encouragements = ["You can do it!", "Believe in yourself!", "Almost there!", "Stay strong!"]
        for (let i = 0; i < encouragements.length; i++) {
          const msgAlpha = Math.max(0, Math.sin(time * 0.03 + i) * 0.8 + 0.2)
          // White text with dark shadow for maximum readability
          ctx.fillStyle = "#ffffff"
          ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"
          ctx.lineWidth = 3
          ctx.font = "bold 16px Arial"
          ctx.strokeText(encouragements[i], 50, 300 + i * 30)
          ctx.fillText(encouragements[i], 50, 300 + i * 30)
        }
        break
    }
  }

  if (gameState === "menu") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8 transition-all duration-1000"
        style={{
          background: "linear-gradient(135deg, #FFB6C1, #FFA07A)",
        }}
      >
        <Card className="p-8 max-w-2xl text-center transform hover:scale-105 transition-transform duration-300 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-orange-100 opacity-50"></div>
          <div className="relative z-10">
            <h1
              className="text-5xl font-bold mb-6 text-pink-600 animate-pulse"
              style={{
                textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
                transform: `translateY(${Math.sin(animationTime * 0.03) * 4}px)`,
              }}
            >
              One Year With You
            </h1>
            <p className="text-lg mb-6 text-gray-700 leading-relaxed font-medium">
              A heartwarming journey through our first year together. Navigate through 12 months of memories,
              challenges, and love as Ansu in this romantic platformer adventure.
            </p>
            <div className="mb-6 p-4 bg-pink-50 rounded-lg border-2 border-pink-200 shadow-inner">
              <p className="text-sm text-gray-600 mb-2 font-semibold">Controls:</p>
              <p className="text-sm text-gray-600">Arrow Keys or WASD to move • Space to jump</p>
              <p className="text-xs text-gray-500 mt-1">Each level has unique mechanics and challenges!</p>
            </div>
            <div className="flex gap-4 justify-center items-center">
              <Button
                onClick={startGame}
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{
                  animation: `pulse 2s infinite`,
                }}
              >
                Start Our Journey <Heart className="ml-2 animate-bounce" size={20} />
              </Button>
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="transform hover:scale-110 transition-all duration-300 bg-transparent"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Enhanced romantic floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <Heart
              key={`heart-${i}`}
              className="absolute text-pink-300 opacity-40 animate-bounce"
              size={12 + (i % 4) * 6}
              style={{
                left: `${3 + i * 6.5}%`,
                top: `${10 + Math.sin(animationTime * 0.008 + i) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${1.8 + i * 0.2}s`,
                transform: `rotate(${Math.sin(animationTime * 0.015 + i) * 15}deg)`,
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <Star
              key={`star-${i}`}
              className="absolute text-yellow-300 opacity-30 animate-pulse"
              size={8 + (i % 3) * 4}
              style={{
                left: `${10 + i * 11}%`,
                top: `${60 + Math.sin(animationTime * 0.012 + i) * 25}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${2.2 + i * 0.3}s`,
              }}
            />
          ))}
          {/* Floating romantic text */}
          <div
            className="absolute text-pink-200 opacity-20 text-6xl font-bold pointer-events-none"
            style={{
              left: "20%",
              top: "30%",
              transform: `rotate(-15deg) translateY(${Math.sin(animationTime * 0.01) * 10}px)`,
              fontFamily: "cursive",
            }}
          >
            Love
          </div>
          <div
            className="absolute text-pink-200 opacity-20 text-4xl font-bold pointer-events-none"
            style={{
              right: "15%",
              bottom: "25%",
              transform: `rotate(10deg) translateY(${Math.sin(animationTime * 0.015) * 8}px)`,
              fontFamily: "cursive",
            }}
          >
            Forever
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "playing") {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 bg-white"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    )
  }

  if (gameState === "levelComplete") {
    const level = levels[currentLevel]
    if (!level) return null

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8 transition-all duration-1000 relative overflow-hidden"
        style={{
          background: level.completionTheme.background,
        }}
      >
        {/* Month-specific animated canvas background */}
        <canvas
          ref={(canvas) => {
            if (canvas) {
              const ctx = canvas.getContext("2d")
              if (ctx) {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                canvas.style.position = "absolute"
                canvas.style.top = "0"
                canvas.style.left = "0"
                canvas.style.zIndex = "1"
                canvas.style.pointerEvents = "none"
                renderCompletionAnimations(level, ctx, canvas)
              }
            }
          }}
          className="absolute inset-0"
        />

        <Card className="p-8 max-w-2xl text-center transform animate-pulse shadow-2xl relative overflow-hidden z-10 bg-white/90 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/20"></div>
          <div className="relative z-10">
            <h2
              className="text-4xl font-bold mb-6"
              style={{
                color: level.completionTheme.textColor,
                transform: `translateY(${Math.sin(completionAnimationTime * 0.08) * 6}px)`,
                textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
                fontFamily: "serif",
              }}
            >
              {level.month} Complete!
            </h2>

            <div className="mb-4 text-sm font-medium" style={{ color: level.completionTheme.accentColor }}>
              {level.completionTheme.vibe}
            </div>

            <div className="mb-6 p-6 bg-white/80 rounded-lg border-2 border-white/50 transform hover:scale-105 transition-transform duration-300 shadow-inner">
              <p
                className="text-xl italic font-medium leading-relaxed"
                style={{
                  color: level.completionTheme.textColor,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  fontFamily: "serif",
                }}
              >
                "{level.message}"
              </p>
            </div>
            <Button
              onClick={nextLevel}
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: level.completionTheme.accentColor,
                borderColor: level.completionTheme.accentColor,
              }}
            >
              {currentLevel < levels.length - 1 ? "Next Month" : "Complete Journey"}
              <Heart className="ml-2 animate-pulse" size={20} />
            </Button>
          </div>
        </Card>

        {/* Enhanced celebration particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(20)].map((_, i) => (
            <Star
              key={i}
              className="absolute opacity-70 animate-spin"
              size={12 + (i % 4) * 4}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                color: level.completionTheme.accentColor,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (gameState === "graffitiWall") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8 transition-all duration-1000 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2C1810, #8B4513, #D2691E)",
        }}
      >
        {/* Enhanced animated graffiti wall background */}
        <canvas
          ref={(canvas) => {
            if (canvas) {
              const ctx = canvas.getContext("2d")
              if (ctx) {
                // Enhanced animated graffiti wall background with more romantic elements
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                canvas.style.position = "absolute"
                canvas.style.top = "0"
                canvas.style.left = "0"
                canvas.style.zIndex = "1"
                canvas.style.pointerEvents = "none"

                // Draw brick wall texture
                ctx.fillStyle = "#8B4513"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw brick pattern
                const brickWidth = 80
                const brickHeight = 40
                for (let y = 0; y < canvas.height; y += brickHeight) {
                  for (let x = 0; x < canvas.width; x += brickWidth) {
                    const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2
                    ctx.strokeStyle = "#654321"
                    ctx.lineWidth = 2
                    ctx.strokeRect(x + offset, y, brickWidth, brickHeight)
                  }
                }

                // Romantic floating hearts with enhanced trails and glow
                for (let i = 0; i < 20; i++) {
                  const heartX = (animationTime * 0.4 + i * 90) % (canvas.width + 150)
                  const heartY = 80 + Math.sin(animationTime * 0.008 + i) * 60
                  const heartSize = 16 + Math.sin(animationTime * 0.01 + i) * 8
                  const heartAlpha = 0.2 + 0.4 * Math.sin(animationTime * 0.015 + i)

                  // Enhanced heart trail effect with multiple colors
                  for (let j = 0; j < 8; j++) {
                    const trailX = heartX - j * 12
                    const trailY = heartY + j * 3 + Math.sin(animationTime * 0.02 + j) * 5
                    const trailAlpha = heartAlpha * (1 - j * 0.12)
                    const trailSize = heartSize * (1 - j * 0.08)
                    const hue = ((animationTime * 0.5 + i * 30 + j * 15) % 60) + 300 // Pink to red spectrum

                    ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${trailAlpha})`
                    ctx.shadowColor = `hsla(${hue}, 80%, 65%, 0.8)`
                    ctx.shadowBlur = 12 + j * 2
                    ctx.font = `${trailSize}px Arial`
                    ctx.fillText("♥", trailX, trailY)
                  }
                  ctx.shadowBlur = 0
                }

                // Romantic sparkle constellation with twinkling effect
                for (let i = 0; i < 35; i++) {
                  const sparkleX = (i * 45) % canvas.width
                  const sparkleY = ((animationTime * 0.3 + i * 40) % (canvas.height + 120)) - 60
                  const twinkle = Math.sin(animationTime * 0.05 + i * 0.7) * 0.5 + 0.5
                  const sparkleAlpha = 0.3 + 0.5 * twinkle
                  const sparkleSize = 2 + Math.sin(animationTime * 0.04 + i) * 2

                  ctx.fillStyle = `rgba(255, 215, 0, ${sparkleAlpha})`
                  ctx.shadowColor = "gold"
                  ctx.shadowBlur = 15 * twinkle
                  ctx.beginPath()
                  ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2)
                  ctx.fill()

                  // Enhanced cross sparkle effect
                  ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleAlpha})`
                  ctx.lineWidth = 2
                  ctx.shadowBlur = 8
                  ctx.beginPath()
                  ctx.moveTo(sparkleX - 8, sparkleY)
                  ctx.lineTo(sparkleX + 8, sparkleY)
                  ctx.moveTo(sparkleX, sparkleY - 8)
                  ctx.lineTo(sparkleX, sparkleY + 8)
                  ctx.stroke()
                  ctx.shadowBlur = 0
                }

                // Floating love messages with enhanced glow and movement
                const loveMessages = ["Forever", "Always", "Together", "Love", "♥", "∞", "Soulmates", "Eternal"]
                for (let i = 0; i < loveMessages.length; i++) {
                  const msgX = (animationTime * 0.6 + i * 180) % (canvas.width + 200)
                  const msgY =
                    150 + Math.sin(animationTime * 0.006 + i) * 80 + Math.cos(animationTime * 0.004 + i * 0.5) * 30
                  const msgAlpha = 0.4 + 0.5 * Math.sin(animationTime * 0.012 + i)
                  const msgSize = 20 + Math.sin(animationTime * 0.008 + i) * 8
                  const rotation = Math.sin(animationTime * 0.003 + i) * 0.2

                  ctx.save()
                  ctx.translate(msgX, msgY)
                  ctx.rotate(rotation)
                  ctx.fillStyle = `rgba(255, 182, 193, ${msgAlpha})`
                  ctx.shadowColor = "rgba(255, 182, 193, 0.9)"
                  ctx.shadowBlur = 20
                  ctx.font = `${msgSize}px cursive`
                  ctx.textAlign = "center"
                  ctx.fillText(loveMessages[i], 0, 0)
                  ctx.restore()
                  ctx.shadowBlur = 0
                }

                // Enhanced romantic particle swirls with multiple layers
                for (let layer = 0; layer < 3; layer++) {
                  for (let i = 0; i < 25; i++) {
                    const angle = (animationTime * (0.008 + layer * 0.003) + i * 0.25) % (Math.PI * 2)
                    const radius = 80 + layer * 40 + Math.sin(animationTime * 0.005 + i + layer) * 30
                    const centerX = canvas.width * (0.2 + layer * 0.3) + Math.sin(animationTime * 0.003 + layer) * 100
                    const centerY = canvas.height * (0.3 + layer * 0.2) + Math.cos(animationTime * 0.004 + layer) * 80

                    const particleX = centerX + Math.cos(angle) * radius
                    const particleY = centerY + Math.sin(angle) * radius
                    const particleAlpha = 0.15 + 0.35 * Math.sin(animationTime * 0.02 + i + layer * 2)
                    const particleSize = 2 + Math.sin(animationTime * 0.03 + i) * 1.5

                    const hue = (layer * 60 + i * 15 + animationTime * 0.5) % 360
                    ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${particleAlpha})`
                    ctx.shadowColor = `hsla(${hue}, 70%, 60%, 0.8)`
                    ctx.shadowBlur = 8
                    ctx.beginPath()
                    ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.shadowBlur = 0
                  }
                }

                // Romantic butterfly effect
                for (let i = 0; i < 8; i++) {
                  const butterflyX = (animationTime * 0.8 + i * 150) % (canvas.width + 100)
                  const butterflyY = 200 + Math.sin(animationTime * 0.01 + i) * 100
                  const wingFlap = Math.sin(animationTime * 0.3 + i) * 0.5 + 0.5
                  const butterflyAlpha = 0.3 + 0.4 * Math.sin(animationTime * 0.015 + i)

                  ctx.save()
                  ctx.translate(butterflyX, butterflyY)
                  ctx.scale(1, wingFlap)

                  // Butterfly wings
                  ctx.fillStyle = `rgba(255, 20, 147, ${butterflyAlpha})`
                  ctx.shadowColor = "rgba(255, 20, 147, 0.6)"
                  ctx.shadowBlur = 10
                  ctx.beginPath()
                  ctx.ellipse(-8, -5, 6, 8, 0, 0, Math.PI * 2)
                  ctx.ellipse(8, -5, 6, 8, 0, 0, Math.PI * 2)
                  ctx.ellipse(-6, 3, 4, 6, 0, 0, Math.PI * 2)
                  ctx.ellipse(6, 3, 4, 6, 0, 0, Math.PI * 2)
                  ctx.fill()

                  // Butterfly body
                  ctx.fillStyle = `rgba(139, 69, 19, ${butterflyAlpha})`
                  ctx.fillRect(-1, -8, 2, 16)

                  ctx.restore()
                  ctx.shadowBlur = 0
                }

                // Love letter floating effect
                if (animationTime % 600 < 300) {
                  const letterX = canvas.width * 0.7 + Math.sin(animationTime * 0.005) * 50
                  const letterY = canvas.height * 0.4 + Math.cos(animationTime * 0.003) * 30
                  const letterAlpha = 0.6 + 0.3 * Math.sin(animationTime * 0.02)

                  ctx.fillStyle = `rgba(255, 240, 245, ${letterAlpha})`
                  ctx.shadowColor = "rgba(255, 240, 245, 0.8)"
                  ctx.shadowBlur = 15
                  ctx.fillRect(letterX, letterY, 60, 40)

                  // Letter content
                  ctx.fillStyle = `rgba(139, 0, 0, ${letterAlpha})`
                  ctx.font = "8px cursive"
                  ctx.fillText("My Love", letterX + 5, letterY + 15)
                  ctx.fillText("Forever", letterX + 5, letterY + 25)
                  ctx.fillText("Yours ♥", letterX + 5, letterY + 35)

                  ctx.shadowBlur = 0
                }

                // Enhanced soft fade transitions with breathing effect
                const fadeOverlay = 0.02 + 0.015 * Math.sin(animationTime * 0.006)
                ctx.fillStyle = `rgba(44, 24, 16, ${fadeOverlay})`
                ctx.fillRect(0, 0, canvas.width, canvas.height)
              }
            }
          }}
          className="absolute inset-0"
        />

        {/* Draw floating hearts and sparkles */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {floatingHearts.slice(0, 50).map((heart, index) => (
            <div
              key={`floating-heart-${index}`}
              className="absolute text-pink-400 animate-pulse"
              style={{
                left: Math.max(0, Math.min(heart.x, window.innerWidth - 20)),
                top: Math.max(0, Math.min(heart.y, window.innerHeight - 20)),
                fontSize: `${Math.max(12, Math.min(heart.size, 24))}px`,
                opacity: Math.max(0.1, heart.life / heart.maxLife),
                transform: `scale(${Math.max(0.5, Math.min(heart.size / 20, 2))})`,
              }}
            >
              ♥
            </div>
          ))}
          {sparkleParticles.slice(0, 30).map((sparkle, index) => (
            <div
              key={`sparkle-${index}`}
              className="absolute animate-ping"
              style={{
                left: Math.max(0, Math.min(sparkle.x, window.innerWidth - 10)),
                top: Math.max(0, Math.min(sparkle.y, window.innerHeight - 10)),
                width: `${Math.max(2, Math.min(sparkle.size, 8))}px`,
                height: `${Math.max(2, Math.min(sparkle.size, 8))}px`,
                backgroundColor: sparkle.color,
                borderRadius: "50%",
                opacity: Math.max(0.1, sparkle.life / sparkle.maxLife),
                boxShadow: `0 0 ${Math.max(2, Math.min(sparkle.size * 2, 16))}px ${sparkle.color}`,
              }}
            />
          ))}
        </div>

        <Card className="p-12 max-w-6xl text-center transform hover:scale-105 transition-transform duration-500 shadow-2xl relative overflow-hidden bg-gradient-to-br from-amber-50/95 to-orange-50/95 backdrop-blur-sm border-4 border-amber-200 z-10">
          <div className="relative z-10">
            <h1
              className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-500"
              style={{
                transform: `translateY(${Math.sin(animationTime * 0.08) * 4}px)`,
                textShadow: "4px 4px 8px rgba(0,0,0,0.2)",
                fontFamily: "serif",
              }}
            >
              Our Journey
            </h1>

            <div className="mb-10 p-8 bg-gradient-to-r from-amber-50 to-red-50 rounded-2xl border-3 border-amber-300 transform hover:scale-105 transition-transform duration-300 shadow-inner">
              <p className="text-2xl text-amber-800 leading-relaxed font-medium mb-8" style={{ fontFamily: "serif" }}>
                "Twelve months of memories painted on the walls of our hearts..."
              </p>

              {/* Enhanced Interactive Memory Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100">
                {[
                  {
                    month: "August",
                    message: "We said yes. To love, to laughter, and to calls that never ended.",
                    color: "from-pink-200 to-pink-300",
                  },
                  {
                    month: "September",
                    message: "Celebrating me, miles apart. But your voice was my gift.",
                    color: "from-purple-200 to-purple-300",
                  },
                  {
                    month: "October",
                    message: "That mountain held our secret. And the stars witnessed our promise.",
                    color: "from-blue-200 to-blue-300",
                  },
                  {
                    month: "November",
                    message: "Between love and fights, we still chose each other. Every time.",
                    color: "from-red-200 to-red-300",
                  },
                  {
                    month: "December",
                    message: "Even in the quiet, I searched for you. And you were still there.",
                    color: "from-cyan-200 to-cyan-300",
                  },
                  {
                    month: "January",
                    message: "I was in the crowd. You were in my heart. That was enough.",
                    color: "from-indigo-200 to-indigo-300",
                  },
                  {
                    month: "February",
                    message: "Distance tried. But love won. So many times.",
                    color: "from-rose-200 to-rose-300",
                  },
                  {
                    month: "March",
                    message: "I saw you fight through the pressure. I never stopped believing in you.",
                    color: "from-green-200 to-green-300",
                  },
                  {
                    month: "April",
                    message: "Your first flight. Our first beach. My favorite hello.",
                    color: "from-sky-200 to-sky-300",
                  },
                  {
                    month: "May",
                    message: "Another beautiful chapter. And another painful goodbye.",
                    color: "from-orange-200 to-orange-300",
                  },
                  {
                    month: "June",
                    message: "You got in. You made it. And I'm so, so proud of you.",
                    color: "from-emerald-200 to-emerald-300",
                  },
                  {
                    month: "July",
                    message: "Through highs and lows, we made it. One year. One love. Infinite memories.",
                    color: "from-yellow-200 to-yellow-300",
                  },
                ].map((memory, index) => (
                  <div
                    key={memory.month}
                    className={`group relative p-4 bg-gradient-to-br ${memory.color} rounded-xl border-2 border-white/50 transform transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:z-10 cursor-pointer`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      opacity: animationTime > index * 15 ? 1 : 0,
                      transform: `scale(${animationTime > index * 15 ? 1 : 0.8}) translateY(${Math.sin(animationTime * 0.02 + index) * 2}px)`,
                      transition: "all 0.5s ease-out",
                    }}
                    onMouseEnter={() => {
                      setHoveredMonth(memory.month)
                      // Add sparkle effect on hover
                      for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                          addFloatingHeart(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
                          addSparkleParticle(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
                        }, i * 100)
                      }
                    }}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Month Title */}
                    <div className="text-lg font-bold text-amber-800 mb-2 group-hover:text-amber-900 transition-colors duration-300">
                      {memory.month}
                    </div>

                    {/* Heart Icon with Animation */}
                    <div className="flex justify-center mb-3">
                      <Heart
                        className="text-red-500 group-hover:text-red-600 transition-all duration-300 group-hover:scale-125"
                        size={20}
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(220, 20, 60, 0.3))",
                          animation: `pulse 2s infinite ${index * 0.2}s`,
                        }}
                      />
                    </div>

                    {/* Hidden Message - Revealed on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 backdrop-blur-sm border-2 border-amber-300">
                      <div className="flex flex-col justify-center h-full text-center">
                        <h3 className="font-bold text-amber-800 mb-2 text-lg">{memory.month}</h3>
                        <p className="text-sm text-amber-700 italic leading-relaxed font-medium">"{memory.message}"</p>

                        {/* Decorative elements */}
                        <div className="flex justify-center mt-3 space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 bg-red-400 rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-200/20 to-red-200/20 blur-xl"></div>
                    </div>

                    {/* Heart Trail Effect */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <Heart
                            key={i}
                            size={8}
                            className="text-pink-400 animate-bounce"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: "1s",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Enhanced sparkle burst on hover */}
                    {hoveredMonth === memory.month && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute animate-ping"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              width: "4px",
                              height: "4px",
                              backgroundColor: "#FFD700",
                              borderRadius: "50%",
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: "1s",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setGameState("gameComplete")}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl text-white font-bold px-12 py-6 text-xl relative overflow-hidden"
              style={{
                opacity: 1,
                transform: "scale(1)",
                transition: "all 0.3s ease-out",
              }}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-red-400 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
              <span className="relative z-10 flex items-center">
                Enter Our Forever
                <Heart className="ml-2 animate-pulse" size={24} />
              </span>
            </Button>
          </div>
        </Card>

        {/* Enhanced celebration particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(20)].map((_, i) => (
            <Star
              key={i}
              className="absolute opacity-70 animate-spin"
              size={12 + (i % 4) * 4}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.15}s`,\
