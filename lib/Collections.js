
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';


import moment from 'moment';
import { get } from 'lodash';

import { FhirUtilities, AllergyIntolerances, Conditions, CarePlans, Encounters, Immunizations, MedicationStatements, Observations, Patients, Procedures } from 'meteor/clinical:hl7-fhir-data-infrastructure';


if(Meteor.isClient){
  ImportCursor = new Mongo.Collection('ImportCursor', {connection: null});
  ExportCursor = new Mongo.Collection('ExportCursor', {connection: null});
  HealthKitImport = new Mongo.Collection('HealthKitImport', {connection: null});
}



// for the data editor
// if(Meteor.isServer){
  AllergyIntolerances.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  Conditions.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  CarePlans.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  Encounters.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  Immunizations.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  MedicationStatements.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  Observations.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  Patients.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
  Procedures.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
// }
