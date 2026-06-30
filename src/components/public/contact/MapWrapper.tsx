"use client";

import dynamic from "next/dynamic";
import { MapPin } from "@phosphor-icons/react";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-200">
      <div className="flex flex-col items-center gap-3">
        <MapPin className="size-8 animate-bounce text-slate-400" weight="fill" />
        <span className="text-[13px] font-medium text-slate-500">Memuat Peta...</span>
      </div>
    </div>
  )
});

type MapWrapperProps = {
  address: string;
};

export default function MapWrapper({ address }: MapWrapperProps) {
  return <LocationMap address={address} />;
}
