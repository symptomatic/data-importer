Package.describe({
  name: 'symptomatic:data-importer',
  version: '0.16.0',
  summary: 'Data Importer)',
  git: 'http://github.com/symptomatic/data-importer',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('3.0');

  api.use('meteor');
  api.use('webapp');
  api.use('ecmascript');
  api.use('session');
  api.use('mongo');     
  api.use('ejson');
  api.use('random');

  api.use('react-meteor-data@3.0.1');
  api.use('http@1.0.1');    

  //// api.use('fourseven:scss@4.15.0');
  
  // api.use('clinical:hl7-fhir-data-infrastructure@6.33.0');

  // api.addFiles('styles/filepicker.css', 'client');
  // api.addFiles('lib/MedicalRecordImporter.js');
  // api.addFiles('lib/Collections.js');

  // api.addFiles('server/methods.xlsx.js', ['server']);
  // api.addFiles('server/methods.proxy.js', ['server']);

  // api.export('MedicalRecordImporter');
  // api.export('CollectionManagement')

  api.mainModule('index.jsx', 'client');
});


// Npm.depends({
//   "xml2js": "0.4.23",
//   "xlsx": "0.16.0",
//   "papaparse": "5.2.0",
//   "file-dialog": "0.0.8",
//   "promise": "8.3.0"
// });
