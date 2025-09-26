import { StationSkeleton } from "@/components/skeleton";
import { stationsState, savedStationState, selectedStationState } from "@/state";
import type { Station } from "@/types";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";

function Station({
  station,
  onSelect,
}: {
  station: Station & { distance?: string };
  onSelect: () => void;
}) {
  return (
    <button
      className="flex items-center space-x-4 p-4 pr-2 bg-section rounded-lg text-left"
      onClick={onSelect}
    >
      <img src={station.image} className="h-14 w-14 rounded-lg bg-skeleton" />
      <div className="flex-1 space-y-0.5">
        <div className="text-sm">{station.name}</div>
        <div className="text-xs text-inactive">{station.address}</div>
        {station.distance && (
          <div className="text-xs text-primary">{station.distance} km</div>
        )}
      </div>
    </button>
  );
}

function Stations() {
  const setSelectedStation = useSetAtom(savedStationState);
  const navigate = useNavigate();
  const stations = useAtomValue(stationsState);
  return stations.map((station, i) => (
    <Station
      key={station.id}
      station={station}
      onSelect={() => {
        setSelectedStation(station);
        navigate(-1);
      }}
    />
  ));
}

function StationsPage() {
  return (
    <div className="p-4 space-y-2 flex flex-col">
      <Suspense
        fallback={
          <>
            <StationSkeleton />
            <StationSkeleton />
            <StationSkeleton />
            <StationSkeleton />
          </>
        }
      >
        <Stations />
      </Suspense>
    </div>
  );
}

export function SelectedStation() {
  const selectedCompany = useAtomValue(selectedStationState);
  // Khi dữ liệu đã sẵn sàng
  return (
      <Suspense fallback={<div>tải dữ liệu cửa hàng...</div>}>
          <p className="overflow-x-auto whitespace-nowrap text-2xs">
          { selectedCompany?.name}
        </p>
      </Suspense>
      
  );
  
}

export default StationsPage;
