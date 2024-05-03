"use client"
import { create } from 'zustand'

const useStore = create<{
    bears: number
    increasePopulation: () => void
}>((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}))

export default function BearCounter() {
    const bears = useStore((state) => state.bears)
    return <>
        <Controls />
        <h1>{bears} around here...</h1>
    </>
}

function Controls() {
    const increasePopulation = useStore((state) => state.increasePopulation)
    return <button onClick={increasePopulation}>one up</button>
}