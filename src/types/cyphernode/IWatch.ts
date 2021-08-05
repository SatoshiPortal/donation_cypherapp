import IReqWatch from "./IReqWatch";

export default interface IWatch extends IReqWatch {
  // "id":"${id_inserted}",
  // "event":"watch",
  // "imported":${imported},
  // "inserted":${inserted},
  // "address":"${address}",
  // "unconfirmedCallbackURL":${cb0conf_url},
  // "confirmedCallbackURL":${cb1conf_url},
  // "estimatesmartfee2blocks":${fees2blocks},
  // "estimatesmartfee6blocks":${fees6blocks},
  // "estimatesmartfee36blocks":${fees36blocks},
  // "estimatesmartfee144blocks":${fees144blocks},
  // "eventMessage":${event_message}}"

  id: number;
  event: string;
  imported: boolean;
  inserted: boolean;
  estimatesmartfee2blocks: number;
  estimatesmartfee6blocks: number;
  estimatesmartfee36blocks: number;
  estimatesmartfee144blocks: number;
}
