import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Play, ZoomIn, ZoomOut, Maximize2, Download, Upload, Undo2, Redo2, Grid3x3, Move, MousePointer2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { FlowchartNode, NodeData } from './components/flowchart-node';
import { NodeConfigPanel } from './components/node-config-panel';
import { FlowchartShapeType } from './components/flowchart-shapes';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface NodeTemplate {
  id: string;
  type: string;
  label: string;
  description: string;
  category: string;
  shapeType: FlowchartShapeType;
  color: string;
  strokeColor: string;
  defaultWidth: number;
  defaultHeight: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromSide: 'top' | 'right' | 'bottom' | 'left';
  toSide: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
}

const nodeTemplates: NodeTemplate[] = [
  // Start/End
  { id: 'start', type: 'start', label: 'Bắt đầu', description: 'Điểm bắt đầu workflow', category: 'Start/End', shapeType: 'oval', color: '#ec4899', strokeColor: '#be185d', defaultWidth: 120, defaultHeight: 60 },
  { id: 'end', type: 'end', label: 'Kết thúc', description: 'Điểm kết thúc workflow', category: 'Start/End', shapeType: 'oval', color: '#ef4444', strokeColor: '#b91c1c', defaultWidth: 120, defaultHeight: 60 },
  
  // Process
  { id: 'process', type: 'process', label: 'Xử lý', description: 'Thực thi một tác vụ', category: 'Process', shapeType: 'process', color: '#fbbf24', strokeColor: '#d97706', defaultWidth: 140, defaultHeight: 70 },
  { id: 'process_auto', type: 'process', label: 'Tự động hóa', description: 'Xử lý tự động', category: 'Process', shapeType: 'predefinedProcess', color: '#818cf8', strokeColor: '#4f46e5', defaultWidth: 140, defaultHeight: 70 },
  { id: 'process_manual', type: 'process', label: 'Thao tác thủ công', description: 'Cần can thiệp thủ công', category: 'Process', shapeType: 'manualOperation', color: '#f472b6', strokeColor: '#db2777', defaultWidth: 140, defaultHeight: 70 },
  
  // Decision
  { id: 'decision', type: 'decision', label: 'Quyết định', description: 'Rẽ nhánh theo điều kiện', category: 'Decision', shapeType: 'decision', color: '#fb923c', strokeColor: '#ea580c', defaultWidth: 140, defaultHeight: 90 },
  
  // Input/Output
  { id: 'input', type: 'input', label: 'Đầu vào', description: 'Nhận dữ liệu', category: 'Data', shapeType: 'inputOutput', color: '#60a5fa', strokeColor: '#2563eb', defaultWidth: 140, defaultHeight: 70 },
  { id: 'output', type: 'output', label: 'Đầu ra', description: 'Xuất dữ liệu', category: 'Data', shapeType: 'inputOutput', color: '#3b82f6', strokeColor: '#1d4ed8', defaultWidth: 140, defaultHeight: 70 },
  { id: 'document', type: 'output', label: 'Tài liệu', description: 'File/Document', category: 'Data', shapeType: 'document', color: '#a78bfa', strokeColor: '#7c3aed', defaultWidth: 130, defaultHeight: 80 },
  { id: 'database', type: 'database', label: 'Database', description: 'Lưu trữ dữ liệu', category: 'Data', shapeType: 'database', color: '#34d399', strokeColor: '#059669', defaultWidth: 110, defaultHeight: 90 },
  
  // Display
  { id: 'display', type: 'output', label: 'Hiển thị', description: 'Xuất ra màn hình', category: 'Output', shapeType: 'display', color: '#5eead4', strokeColor: '#14b8a6', defaultWidth: 130, defaultHeight: 80 },
  
  // Special
  { id: 'delay', type: 'process', label: 'Chờ/Trì hoãn', description: 'Delay/Wait', category: 'Special', shapeType: 'delay', color: '#fcd34d', strokeColor: '#f59e0b', defaultWidth: 130, defaultHeight: 70 },
  { id: 'merge', type: 'process', label: 'Gộp/Merge', description: 'Hợp nhất luồng', category: 'Special', shapeType: 'merge', color: '#c084fc', strokeColor: '#9333ea', defaultWidth: 110, defaultHeight: 90 },
  { id: 'connector', type: 'connector', label: 'Kết nối', description: 'Connector', category: 'Special', shapeType: 'connector', color: '#94a3b8', strokeColor: '#475569', defaultWidth: 60, defaultHeight: 60 },
  { id: 'offpage', type: 'connector', label: 'Ngoài trang', description: 'Off-page reference', category: 'Special', shapeType: 'offPageConnector', color: '#fb7185', strokeColor: '#e11d48', defaultWidth: 110, defaultHeight: 90 },
  
  // Notification
  { id: 'notification', type: 'notification', label: 'Thông báo', description: 'Gửi thông báo', category: 'Action', shapeType: 'process', color: '#f97316', strokeColor: '#c2410c', defaultWidth: 140, defaultHeight: 70 },
];

interface WorkflowEditorViewProps {
  workflowId?: string;
  onBack?: () => void;
}

export function WorkflowEditorView({ workflowId, onBack }: WorkflowEditorViewProps) {
  const [workflowName, setWorkflowName] = useState(workflowId === 'new' ? 'Workflow mới' : 'Quy trình xử lý video tin tức');
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<'select' | 'pan'>('select');
  const [history, setHistory] = useState<{ nodes: NodeData[], connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragNodeRef = useRef<{ nodeId: string, offsetX: number, offsetY: number } | null>(null);

  const categories = Array.from(new Set(nodeTemplates.map(n => n.category)));

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], connections: [...connections] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, connections, history, historyIndex]);

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Drag from palette
  const handleDragStart = (e: React.DragEvent, template: NodeTemplate) => {
    e.dataTransfer.setData('nodeTemplate', JSON.stringify(template));
  };

  // Drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const templateData = e.dataTransfer.getData('nodeTemplate');
    if (!templateData) return;
    
    const template = JSON.parse(templateData) as NodeTemplate;
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasOffset.x) / scale;
      const y = (e.clientY - rect.top - canvasOffset.y) / scale;
      
      const newNode: NodeData = {
        id: `node_${Date.now()}`,
        type: template.type,
        label: template.label,
        description: template.description,
        shapeType: template.shapeType,
        color: template.color,
        strokeColor: template.strokeColor,
        x: showGrid ? Math.round(x / 20) * 20 : x,
        y: showGrid ? Math.round(y / 20) * 20 : y,
        width: template.defaultWidth,
        height: template.defaultHeight,
      };
      
      setNodes([...nodes, newNode]);
      saveToHistory();
      toast.success('Đã thêm node mới');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Node drag on canvas
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    dragNodeRef.current = {
      nodeId,
      offsetX: (e.clientX - rect.left - canvasOffset.x) / scale - node.x,
      offsetY: (e.clientY - rect.top - canvasOffset.y) / scale - node.y,
    };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragNodeRef.current || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (moveEvent.clientX - rect.left - canvasOffset.x) / scale - dragNodeRef.current.offsetX;
      const y = (moveEvent.clientY - rect.top - canvasOffset.y) / scale - dragNodeRef.current.offsetY;
      
      setNodes(prevNodes => prevNodes.map(n => 
        n.id === dragNodeRef.current?.nodeId 
          ? { ...n, x: showGrid ? Math.round(x / 20) * 20 : x, y: showGrid ? Math.round(y / 20) * 20 : y }
          : n
      ));
    };
    
    const handleMouseUp = () => {
      if (dragNodeRef.current) {
        saveToHistory();
        dragNodeRef.current = null;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Pan canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking directly on canvas background, not on nodes
    if ((tool === 'pan' || e.button === 1) && e.target === e.currentTarget) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    } else if (tool === 'select' && e.target === e.currentTarget) {
      // Deselect when clicking on canvas
      setSelectedNodeId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom
  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.3));
  };

  const handleZoomReset = () => {
    setScale(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  // Node actions
  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom === null) {
      setSelectedNodeId(nodeId);
    } else {
      if (connectingFrom !== nodeId) {
        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          from: connectingFrom,
          to: nodeId,
          fromSide: 'bottom',
          toSide: 'top',
        };
        setConnections([...connections, newConnection]);
        saveToHistory();
        toast.success('Đã tạo kết nối');
      }
      setConnectingFrom(null);
    }
  };

  const handleStartConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
    setSelectedNodeId(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNodeId(null);
    saveToHistory();
    toast.success('Đã xóa node');
  };

  const handleDuplicateNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const newNode: NodeData = {
      ...node,
      id: `node_${Date.now()}`,
      x: node.x + 20,
      y: node.y + 20,
      label: `${node.label} (copy)`,
    };
    
    setNodes([...nodes, newNode]);
    saveToHistory();
    toast.success('Đã nhân bản node');
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<NodeData>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const getConnectionPoint = (nodeId: string, side: 'top' | 'right' | 'bottom' | 'left') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    switch (side) {
      case 'top': return { x: node.x + node.width / 2, y: node.y };
      case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left': return { x: node.x, y: node.y + node.height / 2 };
    }
  };

  // Render connection
  const renderConnection = (connection: Connection) => {
    const fromPos = getConnectionPoint(connection.from, connection.fromSide);
    const toPos = getConnectionPoint(connection.to, connection.toSide);
    
    if (!fromPos || !toPos) return null;
    
    // Create curved path
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;
    
    const path = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x} ${fromPos.y + offset}, ${toPos.x} ${toPos.y - offset}, ${toPos.x} ${toPos.y}`;
    
    return (
      <g key={connection.id}>
        <path
          d={path}
          stroke="#06b6d4"
          strokeWidth={2 / scale}
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {connection.label && (
          <text
            x={midX}
            y={midY}
            fill="#06b6d4"
            fontSize={12 / scale}
            textAnchor="middle"
            className="pointer-events-none"
          >
            {connection.label}
          </text>
        )}
      </g>
    );
  };

  // Export workflow
  const handleExport = () => {
    const data = {
      name: workflowName,
      nodes,
      connections,
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    toast.success('Đã xuất workflow');
  };

  // Import workflow
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setWorkflowName(data.name || 'Imported Workflow');
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
        saveToHistory();
        toast.success('Đã nhập workflow');
      } catch {
        toast.error('File không hợp lệ');
      }
    };
    reader.readAsText(file);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="bg-card border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Separator orientation="vertical" className="h-6 bg-muted" />
            <div className="flex-1 max-w-sm">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Tên workflow..."
                className="bg-muted border-border text-foreground h-9"
              />
            </div>
            <Badge variant="outline" className="border-border text-muted-foreground">
              {nodes.length} nodes
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground">
              {connections.length} connections
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="border-border text-foreground hover:bg-accent"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="border-border text-foreground hover:bg-accent"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-muted" />
            
            {/* Tool selection */}
            <div className="flex gap-1 bg-muted border border-border rounded p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTool('select')}
                className={tool === 'select' ? 'bg-accent text-primary' : 'text-muted-foreground'}
                title="Select tool"
              >
                <MousePointer2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTool('pan')}
                className={tool === 'pan' ? 'bg-accent text-primary' : 'text-muted-foreground'}
                title="Pan tool"
              >
                <Move className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`border-border ${showGrid ? 'text-primary bg-primary/10' : 'text-muted-foreground'} hover:bg-accent`}
              title="Toggle grid"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-muted" />
            
            {/* Zoom controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="border-border text-foreground hover:bg-accent"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="border-border text-foreground hover:bg-accent"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              className="border-border text-foreground hover:bg-accent"
              title="Reset zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-muted" />
            
            {/* Import/Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-file')?.click()}
              className="border-border text-foreground hover:bg-accent"
              title="Import"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-border text-foreground hover:bg-accent"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-muted" />
            
            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              <Play className="w-4 h-4 mr-2" />
              Chạy thử
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </div>
        </div>
        
        {/* Connection mode indicator */}
        {connectingFrom && (
          <div className="mt-2 flex items-center gap-3 p-2 bg-primary/10 border border-primary/50 rounded">
            <span className="text-primary text-sm">Đang kết nối từ node: <strong>{nodes.find(n => n.id === connectingFrom)?.label}</strong></span>
            <span className="text-muted-foreground text-xs">→ Click vào node đích để tạo kết nối</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConnectingFrom(null)}
              className="ml-auto border-red-500 text-red-400 hover:bg-red-900/20"
            >
              Hủy
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-card border-r border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border flex-shrink-0">
            <h3 className="text-primary text-sm">Thư viện Node</h3>
            <p className="text-xs text-muted-foreground mt-1">Kéo thả vào canvas</p>
          </div>
          
          <ScrollArea className="flex-1 h-full">
            <div className="p-3 space-y-4">
              {categories.map(category => (
                <div key={category}>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-admin" />
                    <span>{category}</span>
                    <div className="h-px flex-1 bg-admin" />
                  </div>
                  <div className="space-y-1.5">
                    {nodeTemplates.filter(n => n.category === category).map(template => (
                      <Card
                        key={template.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, template)}
                        className="border-border p-2.5 cursor-move hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div 
                            className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: template.color }}
                          >
                            {template.label.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-foreground leading-tight">{template.label}</div>
                            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{template.description}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 relative bg-muted overflow-hidden"
        >
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              backgroundImage: showGrid ? 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)' : 'none',
              backgroundSize: showGrid ? '20px 20px' : 'auto',
              cursor: tool === 'pan' ? 'grab' : isPanning ? 'grabbing' : 'default',
            }}
          >
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-[10000px] h-[10000px] pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#06b6d4" />
                </marker>
              </defs>
              {connections.map(connection => renderConnection(connection))}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <FlowchartNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isConnecting={connectingFrom === node.id}
                onClick={() => handleNodeClick(node.id)}
                onDelete={() => handleDeleteNode(node.id)}
                onDuplicate={() => handleDuplicateNode(node.id)}
                onStartConnection={() => handleStartConnection(node.id)}
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                scale={scale}
              />
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: `scale(${1 / scale})` }}
              >
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="text-xl mb-2">Kéo thả các node vào đây</div>
                  <div className="text-sm">Bắt đầu thiết kế workflow của bạn</div>
                </div>
              </div>
            )}
          </div>

          {/* Mini-map */}
          <div className="absolute bottom-4 right-4 w-48 h-32 bg-background/90 border border-border rounded overflow-hidden">
            <div className="relative w-full h-full">
              <div className="text-xs text-muted-foreground absolute top-1 left-1 z-10">Mini-map</div>
              <svg className="w-full h-full">
                {nodes.map(node => (
                  <rect
                    key={node.id}
                    x={node.x / 20}
                    y={node.y / 20}
                    width={node.width / 20}
                    height={node.height / 20}
                    fill={node.color}
                    opacity={0.6}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-card border-l border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border flex-shrink-0">
            <h3 className="text-primary text-sm">Thuộc tính Node</h3>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <NodeConfigPanel
              node={selectedNode}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}