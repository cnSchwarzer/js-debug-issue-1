import { contextBridge } from "electron";

contextBridge.exposeInMainWorld('process', process)