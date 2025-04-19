import { memo, useCallback, useState } from 'react';
import { getShapeInfo } from "../../lib/utils";
import { motion } from 'framer-motion';


type Shape = {
  objectId: string;
  type: string;
  [key: string]: any;
};

type LeftSidebarProps = {
  allShape: Array<[string, Shape]>; 
};

const LayerItem = memo(({ shape, isActive, onClick }: { 
  shape: Shape, 
  isActive: boolean,
  onClick: () => void 
}) => {
  const infoLayer = getShapeInfo(shape.type);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group flex items-center gap-5 px-6 py-3.5 rounded-xl cursor-pointer
                transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'bg-blue-500/20 border border-blue-400/30' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
    >
      <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-black/20 p-1.5">
        <img
          src={infoLayer?.icon}
          alt="layer"
          className={`w-5 h-5 invert filter brightness-0 transition-all duration-300 ${
            isActive ? 'drop-shadow-[0_0_3px_rgba(59,130,246,0.7)]' : ''
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium capitalize truncate transition-colors duration-200 ${
          isActive ? 'text-blue-100' : 'text-gray-300 group-hover:text-white'
        }`}>
          {infoLayer.name} {shape.text && `- ${shape.text.substring(0, 15)}${shape.text.length > 15 ? '...' : ''}`}
        </h3>
      </div>
    </motion.div>
  );
});

function LeftSidebar({ allShape }: LeftSidebarProps) {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSelectLayer = useCallback((id: string) => {
    setActiveLayer(prevId => prevId === id ? null : id);
  }, []);
  
  const filteredLayers = searchTerm 
    ? allShape.filter(([_, shape]) => {
        const info = getShapeInfo(shape.type);
        return info.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               (shape.text && shape.text.toLowerCase().includes(searchTerm.toLowerCase()));
      })
    : allShape;

  return (
    <section className="flex flex-col mt-1 bg-[#1E1E1E]/90 shadow-2xl text-white 
                min-w-[225px] md:min-w-[240px] lg:min-w-[255px] sticky left-0 h-full 
                max-sm:hidden select-none overflow-y-auto pb-20 rounded-2xl 
                border border-neutral-800/70 backdrop-blur-md z-10">
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#1E1E1E] to-[#1E1E1E]/95 backdrop-blur-sm px-5 pt-4 pb-2">
        <h3 className="mb-3 text-sm uppercase tracking-wider text-gray-400 font-semibold">
          Layers
        </h3>
        
        {/* Thanh tìm kiếm */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm layer..."
            className="w-full bg-black/20 border border-neutral-700/50 rounded-lg px-3 py-1.5 
                      text-sm text-gray-300 placeholder-gray-500 focus:outline-none 
                      focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="px-3">
        <div className="mt-2 space-y-1.5">
          {filteredLayers.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Không tìm thấy layer' : 'Chưa có layer nào'}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {searchTerm ? 'Thử tìm với từ khóa khác' : 'Thêm hình, text hoặc các đối tượng khác vào canvas'}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1"
            >
              {filteredLayers.map(([id, shape]) => (
                <LayerItem
                  key={shape.objectId || id}
                  shape={shape}
                  isActive={activeLayer === (shape.objectId || id)}
                  onClick={() => handleSelectLayer(shape.objectId || id)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LeftSidebar;