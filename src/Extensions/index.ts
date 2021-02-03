import { createContext } from 'react';
import { extensions } from '../mainCommunication/electron';
import { ExtensionsManager } from 'main/extensions';

export const extensionsManager = new extensions.ExtensionsManager();

extensionsManager.enableExtension(extensions.ExtensionID.StackOverflow);
extensionsManager.enableExtension(extensions.ExtensionID.Documentations);

export const extensionsEmitter = extensionsManager.emitter;
export const ExtensionsContext = createContext<ExtensionsManager>(extensionsManager);
