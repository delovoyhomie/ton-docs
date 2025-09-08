import cp0 from '../../../3rd/tvm-spec/cp0.json';

export type Opcode = {
  name: string;
  alias_of: string;
  tlb: string;
  doc_category: string;
  doc_opcode: string | number;
  doc_fift: string;
  doc_stack: string;
  doc_gas: number | string;
  doc_description: string;
};

// cp0 may be either an array of opcodes or an object with { instructions, aliases }
const cp0Any: any = cp0 as any;
export const opcodes: Opcode[] = Array.isArray(cp0Any)
  ? (cp0Any as Opcode[])
  : ((cp0Any?.instructions ?? []) as Opcode[]);

/* aliases so existing imports don’t crash */
export const appSpecificOpcodes          = opcodes;
export const arithmeticOpcodes           = opcodes;
export const cellManipulationOpcodes     = opcodes;
export const comparisonOpcodes           = opcodes;
export const constantOpcodes             = opcodes;
export const continuationOpcodes         = opcodes;
export const dictionaryManipulationOpcodes = opcodes;
export const exceptionOpcodes            = opcodes;
export const stackManipulationOpcodes    = opcodes;
export const tupleOpcodes                = opcodes;
export const miscellaneousOpcodes        = opcodes;


export { cp0 };
