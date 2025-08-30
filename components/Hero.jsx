"use client";
import Link from 'next/link'
import React, { useRef, useEffect } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

const Hero = () => {

    const imageRef = useRef();

    useEffect(() => {
      const imageElement = imageRef.current;
      const handleScroll = () =>{
        const scrollPosition = window.scrollY;
        const scrollThreshold = 100;
        if (scrollPosition > scrollThreshold) {
          imageElement.classList.add("scrolled");
        }
        else{
            imageElement.classList.remove("scrolled");
        }
      }
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      }
    }, [])
    

    return (
        <div className="pb-20 mt-40 px-4">
            <div className="container mx-auto text-center">
                <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 bg-gradient-to-br from-blue-600 to-purple-600 font-extrabold tracking-tight pr-2 text-transparent bg-clip-text">
                    Manage Your Finances <br /> with Intelligence
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    An AI-Powered financial management app that helps you track your expenses, set budgets, and achieve your financial goals effortlessly.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link href={"/dashboard"} className="">
                        <Button size={"lg"} className={"px-8"}>Get Started
                        </Button>
                    </Link>
                    <Link target='_blank' href={"https://zaid-latif.vercel.app/"} className="">
                        <Button size={"lg"} className={"px-8"}>Contact Me
                        </Button>
                    </Link>
                </div>
                <div className="hero-image-wrapper">
                    <div ref={imageRef} className="hero-image">
                        <Image src={"/banner.jpeg"} alt='Hero Image' width={1180} height={720} priority className='rounded-lg shadow-2xl border mx-auto' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
