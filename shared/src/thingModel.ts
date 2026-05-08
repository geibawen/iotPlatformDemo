export type DataType = 'int' | 'float' | 'bool' | 'string' | 'enum' | 'struct' | 'array';

export type AccessMode = 'r' | 'rw' | 'w';

export interface EnumValue {
  value: number;
  label: string;
}

export interface StructField {
  identifier: string;
  name: string;
  dataType: Exclude<DataType, 'struct'>;
  specs?: DataSpecs;
}

export interface DataSpecs {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  maxLength?: number;
  enumValues?: EnumValue[];
  boolLabels?: { trueLabel: string; falseLabel: string };
  structFields?: StructField[];
  arrayItemType?: Exclude<DataType, 'array'>;
}

export interface ThingModelProperty {
  id: string;
  productId: string;
  identifier: string;
  name: string;
  description: string;
  dataType: DataType;
  accessMode: AccessMode;
  required: boolean;
  specs: DataSpecs;
  createdAt: string;
  updatedAt: string;
}

export interface ActionParam {
  identifier: string;
  name: string;
  dataType: DataType;
  required: boolean;
  specs?: DataSpecs;
}

export interface ThingModelAction {
  id: string;
  productId: string;
  identifier: string;
  name: string;
  description: string;
  inputParams: ActionParam[];
  outputParams: ActionParam[];
  createdAt: string;
  updatedAt: string;
}

export interface ThingModelService {
  id: string;
  productId: string;
  identifier: string;
  name: string;
  description: string;
  propertyIds: string[];
  actionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  int: '整数 (int)',
  float: '浮点数 (float)',
  bool: '布尔值 (bool)',
  string: '字符串 (string)',
  enum: '枚举 (enum)',
  struct: '结构体 (struct)',
  array: '数组 (array)',
};

export const ACCESS_MODE_LABELS: Record<AccessMode, string> = {
  r: '只读',
  rw: '读写',
  w: '只写',
};
