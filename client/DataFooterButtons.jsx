import React from 'react';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { Button } from '@material-ui/core';

import { get } from 'lodash';

import { AllergyIntolerances, CarePlans, Conditions, Consents, Contracts, ClinicalImpressions, Communications, Composition, Devices, DiagnosticReports, DocumentReferences, DocumentManifests, Encounters, Goals, Immunizations, ImagingStudies, Locations, Measures, MeasureReports, Medications, MedicationOrders, MedicationStatements, Organizations, Observations, Patients, Practitioners, Persons, Procedures, Questionnaires, QuestionnaireResponses, RiskAssessments, RelatedPersons, Sequences} from 'meteor/clinical:hl7-fhir-data-infrastructure';


//========================================================================================================
// Theming 

import {
  MuiThemeProvider,
  makeStyles,
  createMuiTheme,
} from '@material-ui/core/styles';

  // Global Theming 
  // This is necessary for the Material UI component render layer
  let palette = {}

  // if we have a globally defined theme from a settings file
  if(get(Meteor, 'settings.public.theme.palette')){
    palette = get(Meteor, 'settings.public.theme.palette');
  }

  const muiTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      appBar: {
        main: palette.appBarColor,
        contrastText: palette.appBarTextColor
      },
      contrastThreshold: 3,
      tonalOffset: 0.2
    }
  });


  const useTabStyles = makeStyles(theme => ({
    west_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: palette.appBarTextColor,
      marginLeft: '20px',
      marginTop: '10px'
    },
    east_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: palette.appBarTextColor,
      right: '20px',
      marginTop: '15px',
      position: 'absolute'
    }
  }));




//============================================================================================================================
// FETCH



export function SampleDialogComponent(props){
  return(
    <div>
      This is a sample component!
    </div>
  )
}

Session.setDefault('editorWrapEnabled', false);
export function ImportButtons(props){
  const buttonClasses = useTabStyles();

  function clearQueue(){
    Session.set('importQueue', []);
  }
  function enableEditorWrap(){
    Session.toggle('editorWrapEnabled');
  }
  function clearAllClientData(){
    console.log('Clear all data cursors!');

    if(confirm("Are you sure?")){
      
      let resourceTypes = [
        'AllergyIntolerances',
        'CarePlans',
        'Conditions',
        'Consents',
        'Contracts',
        'ClinicalImpressions',
        'Communications',
        'Composition',
        'Devices',
        'DiagnosticReports',
        'DocumentReferences',
        'DocumentManifests',
        'Encounters',
        'Goals',
        'Immunizations',
        'ImagingStudies',
        'Locations',
        'Measures',
        'MeasureReports',
        'Medications',
        'MedicationOrders',
        'MedicationStatements',
        'Organizations',
        'Observations',
        'Patients',
        'Practitioners',
        'Persons',
        'Procedures',
        'Questionnaires',
        'QuestionnaireResponses',
        'RiskAssessments',
        'RelatedPersons',
        'Sequences'
      ];

      resourceTypes.forEach(function(resourceType){


        if(Meteor.isClient){
          console.log('Clearing client data for: ', resourceType);

          if(typeof resourceType === "object"){
    
            try {
              console.log('Removing all records from: ', resourceType)  
              resourceType.remove({})
            } catch (error) {
              console.log('Error', error);
              console.log('Trying to remove records one at a time.')
              resourceType.find().forEach(function(record){
                resourceType.remove({_id: record._id})
              })                            
            }
          } else if(typeof window[resourceType] === "object"){
            try {
              window[resourceType].remove()
            } catch (error) {
              window[resourceType].find().forEach(function(record){
                window[resourceType].remove({_id: record._id})
              })                            
            }
          }  
        }
      })
      Session.set('geoJsonLayer', "");    

      // Meteor.call('clearSubscriptionCursors')
    }
  }
  // function toggleDialog(){
  //   console.log('Toggle dialog open/close.')
  //   Session.set('mainAppDialogJson', false);
  //   Session.set('mainAppDialogComponent', "AboutDialog");
  //   Session.set('lastUpdated', new Date())
  //   Session.toggle('mainAppDialogOpen');
  // }


  return (
    <MuiThemeProvider theme={muiTheme} >
      <Button onClick={ enableEditorWrap.bind(this) } className={ buttonClasses.west_button }>
        Editor Wrap
      </Button>
      <Button onClick={ clearAllClientData.bind(this) } className={ buttonClasses.west_button }>
        Clear All Client Data
      </Button>
      {/* <Button onClick={ clearAllClientData.bind(this) } className={ buttonClasses.west_button }>
        Clear All Server Data
      </Button> */}
      {/* <Button onClick={ clearQueue.bind(this) } className={ buttonClasses.west_button }>
        Clear Queue
      </Button> */}
      {/* <Button onClick={ toggleDialog } className={ buttonClasses.east_button }>
        Info Dialog
      </Button> */}
    </MuiThemeProvider>
  );
}


