import React from 'react';

import CollectionManagement from './client/CollectionManagement';
import ImportAlgorithm from './lib/ImportAlgorithm';
import ImportPage from './client/ImportPage';

import MedicalRecordImporter from './lib/MedicalRecordImporter.js';

import { ImportButtons } from './client/DataFooterButtons';

let DynamicRoutes = [{
  'name': 'Import',
  'path': '/import-data',
  'component': ImportPage,
  'requireAuth': true
}];

let AdminSidebarElements = [{
  primaryText: "Data Import",
  to: '/import-data',
  iconName: "fire",
  excludeDevice: ['iPhone', 'iPad'],
  requireAuth: true
}];

let FooterButtons = [{
  pathname: '/import-data',
  component: <ImportButtons />
}];


let AdminDynamicRoutes = DynamicRoutes;

export { 
  DynamicRoutes, 
  AdminDynamicRoutes,
  AdminSidebarElements,
  FooterButtons,

  // DataManagementPage,
  ImportPage,

  MedicalRecordImporter,

  CollectionManagement,
  ImportAlgorithm
};

