"use client"
import { useAuth } from "@clerk/nextjs"


export default function Test(){
    console.log(useAuth())
    return <>
        <div></div>
    </>
}