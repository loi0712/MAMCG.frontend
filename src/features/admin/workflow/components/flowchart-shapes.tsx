// Flowchart SVG Shapes - Standard flowchart symbols
export interface ShapeProps {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

// Start/End/Terminator (Oval)
export function OvalShape({ width = 120, height = 60, fill = '#ec4899', stroke = '#be185d', strokeWidth = 2 }: ShapeProps) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2 - strokeWidth}
        ry={height / 2 - strokeWidth}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Process (Rectangle)
export function ProcessShape({ width = 120, height = 60, fill = '#fbbf24', stroke = '#d97706', strokeWidth = 2 }: ShapeProps) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={width - strokeWidth}
        height={height - strokeWidth}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={4}
      />
    </svg>
  );
}

// Decision (Diamond)
export function DecisionShape({ width = 120, height = 80, fill = '#fb923c', stroke = '#ea580c', strokeWidth = 2 }: ShapeProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const points = `${centerX},${strokeWidth} ${width - strokeWidth},${centerY} ${centerX},${height - strokeWidth} ${strokeWidth},${centerY}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Input/Output (Parallelogram)
export function InputOutputShape({ width = 120, height = 60, fill = '#60a5fa', stroke = '#2563eb', strokeWidth = 2 }: ShapeProps) {
  const offset = 15;
  const points = `${offset},${strokeWidth / 2} ${width - strokeWidth / 2},${strokeWidth / 2} ${width - offset},${height - strokeWidth / 2} ${strokeWidth / 2},${height - strokeWidth / 2}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Data/Document
export function DocumentShape({ width = 120, height = 70, fill = '#a78bfa', stroke = '#7c3aed', strokeWidth = 2 }: ShapeProps) {
  const waveHeight = 10;
  const path = `
    M ${strokeWidth / 2} ${strokeWidth / 2}
    L ${width - strokeWidth / 2} ${strokeWidth / 2}
    L ${width - strokeWidth / 2} ${height - waveHeight}
    Q ${width * 0.75} ${height - waveHeight / 2}, ${width / 2} ${height - waveHeight}
    Q ${width * 0.25} ${height - waveHeight - waveHeight / 2}, ${strokeWidth / 2} ${height - waveHeight}
    Z
  `;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Database/Data Storage (Cylinder)
export function DatabaseShape({ width = 100, height = 80, fill = '#34d399', stroke = '#059669', strokeWidth = 2 }: ShapeProps) {
  const ellipseRy = 12;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Top ellipse */}
      <ellipse
        cx={width / 2}
        cy={ellipseRy}
        rx={width / 2 - strokeWidth}
        ry={ellipseRy}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Body */}
      <rect
        x={strokeWidth / 2}
        y={ellipseRy}
        width={width - strokeWidth}
        height={height - ellipseRy * 2}
        fill={fill}
        stroke="none"
      />
      {/* Side lines */}
      <line
        x1={strokeWidth / 2}
        y1={ellipseRy}
        x2={strokeWidth / 2}
        y2={height - ellipseRy}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <line
        x1={width - strokeWidth / 2}
        y1={ellipseRy}
        x2={width - strokeWidth / 2}
        y2={height - ellipseRy}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Bottom ellipse */}
      <ellipse
        cx={width / 2}
        cy={height - ellipseRy}
        rx={width / 2 - strokeWidth}
        ry={ellipseRy}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Predefined Process (Rectangle with side bars)
export function PredefinedProcessShape({ width = 120, height = 60, fill = '#818cf8', stroke = '#4f46e5', strokeWidth = 2 }: ShapeProps) {
  const sideBarOffset = 12;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={width - strokeWidth}
        height={height - strokeWidth}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={4}
      />
      <line
        x1={sideBarOffset}
        y1={strokeWidth / 2}
        x2={sideBarOffset}
        y2={height - strokeWidth / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <line
        x1={width - sideBarOffset}
        y1={strokeWidth / 2}
        x2={width - sideBarOffset}
        y2={height - strokeWidth / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Manual Operation (Trapezoid)
export function ManualOperationShape({ width = 120, height = 60, fill = '#f472b6', stroke = '#db2777', strokeWidth = 2 }: ShapeProps) {
  const topOffset = 15;
  const points = `${topOffset},${strokeWidth / 2} ${width - topOffset},${strokeWidth / 2} ${width - strokeWidth / 2},${height - strokeWidth / 2} ${strokeWidth / 2},${height - strokeWidth / 2}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Connector/Circle
export function ConnectorShape({ width = 50, height = 50, fill = '#94a3b8', stroke = '#475569', strokeWidth = 2 }: ShapeProps) {
  const radius = Math.min(width, height) / 2 - strokeWidth;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <circle
        cx={width / 2}
        cy={height / 2}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Delay/Wait
export function DelayShape({ width = 120, height = 60, fill = '#fcd34d', stroke = '#f59e0b', strokeWidth = 2 }: ShapeProps) {
  const rightCurveX = width - 30;
  const path = `
    M ${strokeWidth / 2} ${strokeWidth / 2}
    L ${rightCurveX} ${strokeWidth / 2}
    Q ${width - strokeWidth / 2} ${height / 2}, ${rightCurveX} ${height - strokeWidth / 2}
    L ${strokeWidth / 2} ${height - strokeWidth / 2}
    Z
  `;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Merge/Junction
export function MergeShape({ width = 100, height = 80, fill = '#c084fc', stroke = '#9333ea', strokeWidth = 2 }: ShapeProps) {
  const centerX = width / 2;
  // Triangle pointing down
  const points = `${centerX},${height - strokeWidth} ${width - strokeWidth},${strokeWidth} ${strokeWidth},${strokeWidth}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Display/Screen
export function DisplayShape({ width = 120, height = 70, fill = '#5eead4', stroke = '#14b8a6', strokeWidth = 2 }: ShapeProps) {
  const curveOffset = 15;
  const path = `
    M ${curveOffset} ${strokeWidth / 2}
    L ${width - curveOffset} ${strokeWidth / 2}
    Q ${width - strokeWidth / 2} ${height / 2}, ${width - curveOffset} ${height - strokeWidth / 2}
    L ${curveOffset} ${height - strokeWidth / 2}
    Q ${strokeWidth / 2} ${height / 2}, ${curveOffset} ${strokeWidth / 2}
    Z
  `;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Off-page Connector (Pentagon pointing down)
export function OffPageConnectorShape({ width = 100, height = 80, fill = '#fb7185', stroke = '#e11d48', strokeWidth = 2 }: ShapeProps) {
  const centerX = width / 2;
  const bottomY = height - strokeWidth;
  const topY = strokeWidth;
  const midY = height * 0.6;
  
  const points = `${strokeWidth},${topY} ${width - strokeWidth},${topY} ${width - strokeWidth},${midY} ${centerX},${bottomY} ${strokeWidth},${midY}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Export shape components map
export const FLOWCHART_SHAPES = {
  oval: OvalShape,
  process: ProcessShape,
  decision: DecisionShape,
  inputOutput: InputOutputShape,
  document: DocumentShape,
  database: DatabaseShape,
  predefinedProcess: PredefinedProcessShape,
  manualOperation: ManualOperationShape,
  connector: ConnectorShape,
  delay: DelayShape,
  merge: MergeShape,
  display: DisplayShape,
  offPageConnector: OffPageConnectorShape,
} as const;

export type FlowchartShapeType = keyof typeof FLOWCHART_SHAPES;
