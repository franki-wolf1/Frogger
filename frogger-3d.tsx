import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Sphere, Text, OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'

function Frog({ position, onMove, onCollision }) {
  const ref = useRef()
  const [frogPos, setFrogPos] = useState(new Vector3(...position))

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newPos = frogPos.clone()
      switch (e.key) {
        case 'ArrowUp':
          newPos.z -= 1
          break
        case 'ArrowDown':
          newPos.z += 1
          break
        case 'ArrowLeft':
          newPos.x -= 1
          break
        case 'ArrowRight':
          newPos.x += 1
          break
      }
      newPos.x = Math.max(-4, Math.min(4, newPos.x))
      newPos.z = Math.max(-5, Math.min(5, newPos.z))
      setFrogPos(newPos)
      onMove(newPos)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [frogPos, onMove])

  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(frogPos)
    }
  })

  return (
    <Sphere ref={ref} args={[0.5, 32, 32]} position={position}>
      <meshStandardMaterial color="green" />
    </Sphere>
  )
}

function Car({ position, speed }) {
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.x += speed * delta
      if (ref.current.position.x > 5) {
        ref.current.position.x = -5
      } else if (ref.current.position.x < -5) {
        ref.current.position.x = 5
      }
    }
  })

  return (
    <Box ref={ref} args={[1, 0.5, 0.5]} position={position}>
      <meshStandardMaterial color="red" />
    </Box>
  )
}

function Log({ position, speed }) {
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.x += speed * delta
      if (ref.current.position.x > 5) {
        ref.current.position.x = -5
      } else if (ref.current.position.x < -5) {
        ref.current.position.x = 5
      }
    }
  })

  return (
    <Box ref={ref} args={[2, 0.5, 0.5]} position={position}>
      <meshStandardMaterial color="brown" />
    </Box>
  )
}

function Game() {
  const [frogPosition, setFrogPosition] = useState(new Vector3(0, 0.5, 5))
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const carsRef = useRef([
    { position: [-3, 0.25, 3], speed: 2 },
    { position: [2, 0.25, 2], speed: -3 },
    { position: [-1, 0.25, 1], speed: 2.5 },
    { position: [3, 0.25, 0], speed: -2 },
    { position: [0, 0.25, -1], speed: 3 },
  ])
  const logsRef = useRef([
    { position: [-2, 0.25, -2], speed: 1 },
    { position: [2, 0.25, -3], speed: -1.5 },
    { position: [-3, 0.25, -4], speed: 1.2 },
  ])

  useFrame(() => {
    if (gameOver) return

    // Check collision with cars
    carsRef.current.forEach(car => {
      const carPos = new Vector3(...car.position)
      if (carPos.distanceTo(frogPosition) < 0.75) {
        setGameOver(true)
      }
    })

    // Check if frog is on a log
    let onLog = false
    logsRef.current.forEach(log => {
      const logPos = new Vector3(...log.position)
      if (Math.abs(logPos.z - frogPosition.z) < 0.25 && Math.abs(logPos.x - frogPosition.x) < 1) {
        onLog = true
        setFrogPosition(prev => new Vector3(prev.x + log.speed * 0.016, prev.y, prev.z))
      }
    })

    // Check if frog is in water
    if (frogPosition.z < -1.5 && frogPosition.z > -4.5 && !onLog) {
      setGameOver(true)
    }

    // Check if frog reached the end
    if (frogPosition.z <= -5) {
      setScore(prev => prev + 1)
      setFrogPosition(new Vector3(0, 0.5, 5))
    }
  })

  const handleFrogMove = (newPos) => {
    setFrogPosition(newPos)
  }

  const resetGame = () => {
    setGameOver(false)
    setScore(0)
    setFrogPosition(new Vector3(0, 0.5, 5))
  }

  return (
    <>
      <Frog position={frogPosition.toArray()} onMove={handleFrogMove} />
      {carsRef.current.map((car, index) => (
        <Car key={`car-${index}`} position={car.position} speed={car.speed} />
      ))}
      {logsRef.current.map((log, index) => (
        <Log key={`log-${index}`} position={log.position} speed={log.speed} />
      ))}
      <Box position={[0, 0, 0]} args={[10, 0.1, 11]}>
        <meshStandardMaterial color="gray" />
      </Box>
      <Box position={[0, 0, -3]} args={[10, 0.1, 3]}>
        <meshStandardMaterial color="blue" />
      </Box>
      <Text position={[0, 2, 0]} fontSize={0.5} color="white">
        Score: {score}
      </Text>
      {gameOver && (
        <>
          <Text position={[0, 0, 0]} fontSize={1} color="white">
            Game Over!
          </Text>
          <Box position={[0, -1, 0]} args={[2, 0.5, 0.5]} onClick={resetGame}>
            <meshStandardMaterial color="blue" />
            <Text position={[0, 0, 0.26]} fontSize={0.2} color="white">
              Play Again
            </Text>
          </Box>
        </>
      )}
    </>
  )
}

export default function Component() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 8, 8], rotation: [-Math.PI / 4, 0, 0] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Game />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
      <div className="absolute top-0 left-0 text-white p-4">
        <h1 className="text-2xl font-bold">3D Frogger</h1>
        <p>Use arrow keys to move the frog!</p>
      </div>
    </div>
  )
}
