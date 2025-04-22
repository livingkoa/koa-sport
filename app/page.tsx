import EmailForm from "@/components/email-form"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KOA SPORT | Performance Mineral Sunscreen",
  description: "KOA SPORT Performance Mineral Sunscreen dropping 06.25",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="container mx-auto px-6 py-12 max-w-md flex flex-col items-center justify-between min-h-screen">
        <div className="w-full flex flex-col items-center">
          {/* KOA SPORT logo with minimal overlap */}
          <div className="relative w-full max-w-xs mb-4">
            <div className="relative mx-auto">
              <div className="relative w-[70%] mx-auto z-10">
                <Image src="/images/koa-logo.svg" alt="KOA" width={250} height={82} className="w-full" priority />
              </div>
              <div className="relative -mt-2">
                <Image src="/images/sport-logo.svg" alt="SPORT" width={351} height={82} className="w-full" priority />
              </div>
            </div>
          </div>

          {/* Product details text */}
          <div className="text-center mb-8 mt-13">
            <div className="uppercase tracking-widest text-sm font-light">
              <p>PERFORMANCE</p>
              <p>MINERAL SUNSCREEN</p>
              <p>06.25</p>
            </div>
          </div>

          {/* Running man GIF */}
          <div className="w-full mb-5 flex justify-center">
            <div className="w-full max-w-xs">
              <Image
                src="/images/running-man.gif"
                alt="Running figure"
                width={400}
                height={400}
                className="w-full"
                unoptimized // Important for GIFs to animate properly
              />
            </div>
          </div>
        </div>

        <div className="w-full">
          <EmailForm />
        </div>
      </div>
    </main>
  )
}
