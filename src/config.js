/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const databaseUrl = process.env.DATABASE_URL || 'sqlite:database.sqlite';

export const analytics = {

  // https://analytics.google.com/
  google: {
    trackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

};

export const auth = {

  jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },

  // https://developers.facebook.com/
  facebook: {
    id: process.env.FACEBOOK_APP_ID || '186244551745631',
    secret: process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc',
  },

  // https://cloud.google.com/console/project
  google: {
    id: process.env.GOOGLE_CLIENT_ID || '558653204817-gvd62kp9oerkbhkk4hend4tujvc53jfp.apps.googleusercontent.com',
    secret: process.env.GOOGLE_CLIENT_SECRET || 'j_KigruLYn_0FdZP6cXDa8cP',
  },

  // https://apps.twitter.com/
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
    secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
  },


};


export const calendarEncryptSecret = "ca6959d1-d4c8-418e-878e-93aac1089993";


export const dataMap = {
    PROJECT_FIELD_MAP: {
          'crew': '092f8b6b0e6e9d50af512bb0dae8d6bf50c1c345',
          'filmingDates': 'e8a75e8a7e81852ca94abda7f9c9e898997aca52',
          'finalDeadline': '7b785e4d0aa1e93951065c8ceb784d827da3b532',
          'projectName': 'da0e73bb413d2bf582c0e6d758dd787889ba9b97',
          'transferFileMethod': 'b0956fa669b346a6d9247760c713f34398016026',
          'description': '35490f0388fdb40ae694bcae99377afd74554dd5',
          'positionsNeeded': '525a68964cd0e0f66493819c9cb7003204e4f047'
    },
    PERSON_FIELD_MAP: {
        'password': '891999ff541ecc95b51e25f8ed230df11b816a4f',
        'role': '7f2ecafe427ee60cf8c550969dbe494caf92684f',
        'salary': 'bfef00b1dbc3f7a4a6067545a603d1b56a8300a1',
        'calendarAccessToken': '56e5af17b63545120da6fd9662c97bef02affdaf',
        'calendarRefreshToken': '1db325fbdb7e4e5ca0773c8d25a87fad7f95f453',
        'calendarId': 'c970460a0388853c8d45e42c14202a3277f321c9'
    },
    //for creating person filters
    PERSON_FIELD_ID_MAP: {
        'id': '9049',
        'role': '9061',
        'salary': '9062',
    },
   PROJECT_STAGES: {
         'Created': 6,
         'Pending': 8,
         'Confirmed': 9,
         'Complete': 10
     }
};
