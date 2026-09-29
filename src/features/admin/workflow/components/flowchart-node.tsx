import { FLOWCHART_SHAPES, type FlowchartShapeType } from './flowchart-shapes';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Copy, Link2 } from 'lucide-react';

export interface NodeData {
  id: string;
  type: string;
  label: string;
  description?: string;
  shapeType: FlowchartShapeType;
  color: string;
  strokeColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config?: Record<string, any>;
}

interface FlowchartNodeProps {
  node: NodeData;
  isSelected: boolean;
  isConnecting: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartConnection: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  scale?: number;
}

export function FlowchartNode({
  node,
  isSelected,
  isConnecting,
  onClick,
  onDelete,
  onDuplicate,
  onStartConnection,
  onDragStart,
}: FlowchartNodeProps) {
  const ShapeComponent = FLOWCHART_SHAPES[node.shapeType];

  return (
    <div
      style={{ 
        left: node.x, 
        top: node.y,
        width: node.width,
        height: node.height,
      }}
      className={`absolute cursor-pointer transition-all group ${
        isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0a0e1a] z-20' : 'z-10'
      } ${isConnecting ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0a0e1a]' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart?.(e);
        }}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move bg-muted rounded px-2 py-1 flex items-center gap-1 z-10"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Shape */}
      <div 
        className="relative w-full h-full cursor-move shape-container"
        onMouseDown={(e) => {
          // Only drag if not clicking on action buttons or connection points
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !target.closest('.connection-point')) {
            e.stopPropagation();
            onDragStart?.(e);
          }
        }}
      >
        <div className="shape-svg">
          <ShapeComponent 
            width={node.width} 
            height={node.height}
            fill={node.color}
            stroke={node.strokeColor}
          />
        </div>
        
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-none">
          <div className="text-center text-white text-xs font-medium leading-tight break-words max-w-full px-2">
            {node.label}
          </div>
          {node.description && (
            <div className="text-center text-white/70 text-[10px] mt-1 leading-tight">
              {node.description}
            </div>
          )}
        </div>

        {/* Connection points */}
        <div className="connection-point absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair" title="Top connection" />
        <div className="connection-point absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair" title="Right connection" />
        <div className="connection-point absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair" title="Bottom connection" />
        <div className="connection-point absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair" title="Left connection" />
      </div>

      {/* Action buttons */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-muted rounded p-1 shadow-lg">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection();
          }}
          className="h-7 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
          title="Kết nối"
        >
          <Link2 className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
          title="Nhân bản"
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          title="Xóa"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
