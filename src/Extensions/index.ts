import { createContext } from 'react';
import { EventEmitter } from 'events';
import { extensions } from '../mainCommunication/electron';
import { ExtensionsManager } from 'main/extensions';

export const extensionsManager = new extensions.ExtensionsManager();

extensionsManager.enableExtension('stackoverflow');

export const extensionsEmitter = extensionsManager.emitter;



export const ExtensionsContext = createContext<ExtensionsManager>(extensionsManager);
