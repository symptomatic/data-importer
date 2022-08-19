Package.describe({
  name: 'symptomatic:data-importer',
  version: '0.13.3',
  summary: 'Data Importer)',
  git: 'http://github.com/symptomatic/data-importer',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');

  api.use('meteor-base@1.4.0');
  api.use('ecmascript@0.15.0');
  api.use('react-meteor-data@2.4.0');

  api.use('session');
  api.use('mongo');
  api.use('http');
  api.use('ejson');
  api.use('random');
  api.use('fourseven:scss@4.15.0');

  // api.use('webapp@1.10.0');
  // api.use('ddp@1.4.0');
  // api.use('livedata@1.0.18');
  // api.use('es5-shim@4.8.0');


  // api.use('jparker:crypto-aes');
  // api.use('clinical:csv@0.3.0');

  
  api.use('clinical:hl7-fhir-data-infrastructure@6.26.21');

  api.addFiles('styles/filepicker.css', 'client');
  api.addFiles('lib/MedicalRecordImporter.js');

  api.addFiles('server/methods.xlsx.js', ['server']);
  api.addFiles('server/methods.proxy.js', ['server']);

  api.export('MedicalRecordImporter');
  api.export('CollectionManagement')

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  // 'react-dropzone-component': '2.0.0',
  "xml2js": "0.4.23",
  "xlsx": "0.16.0",
  "papaparse": "5.2.0",
  "file-dialog": "0.0.8"
});
