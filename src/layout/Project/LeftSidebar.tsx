import { getShapeInfo } from "../../lib/utils";

export default function LeftSidebar({ allShape }: { allShape: Array<any> }) {
  return (
    <section className="flex flex-col mt-1 bg-gradient-to-br from-[#3a3a3a] via-[#2b2b2b] to-[#1a1a1a] shadow-2xl text-white min-w-[225px] md:min-w-[240px] lg:min-w-[225px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20 rounded-3xl border border-[#555] backdrop-blur-lg backdrop-filter bg-opacity-40">
      <h3 className="px-6 pt-5 text-sm uppercase tracking-wider text-gray-400 font-bold">
        Layer
      </h3>
      <div className="flex flex-col mt-6 space-y-4">
        {allShape.length === 0 ? (
          <p className="px-6 py-4 text-gray-500 animate-pulse">
            No layers available
          </p>
        ) : (
          <>
            {allShape?.map((allShapes: any) => {
              const inforLayer = getShapeInfo(allShapes[1]?.type);
              return (
                <div
                  key={allShapes[1].objectId}
                  className="group flex items-center gap-5 px-6 py-4 bg-opacity-20 hover:bg-opacity-30 rounded-2xl cursor-pointer transition-transform transform hover:scale-105 duration-200 ease-in-out shadow-lg hover:shadow-2xl"
                >
                  <img
                    src={inforLayer?.icon}
                    alt="layer"
                    className="w-7 h-7 filter drop-shadow-md transition-transform transform group-hover:rotate-6"
                  />
                  <h3 className="text-base font-semibold capitalize text-gray-300 group-hover:text-white transition-colors duration-200">
                    {inforLayer.name}
                  </h3>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
