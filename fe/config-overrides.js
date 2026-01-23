const path = require('path');
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add webpack plugins to handle MUI imports from DevExpress scheduler
  config.plugins = config.plugins || [];
  
  // Replace @mui/icons-material/esm/* imports with the correct MUI v7 import
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /^@mui\/icons-material\/esm\/(.+)$/,
      function(resource) {
        const match = resource.request.match(/^@mui\/icons-material\/esm\/(.+)$/);
        if (match) {
          const iconName = match[1].replace(/\.js$/, '');
          // Map to the correct MUI v7 import path
          resource.request = `@mui/icons-material/${iconName}`;
        }
      }
    )
  );
  
  // Replace @mui/x-date-pickers/*/index.js imports with the correct MUI v8 import
  // The DevExpress scheduler expects old paths like @mui/x-date-pickers/DateTimePicker/index.js
  // In MUI v8, these should be @mui/x-date-pickers/DateTimePicker
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /^@mui\/x-date-pickers\/(.+)\/index\.js$/,
      function(resource) {
        const match = resource.request.match(/^@mui\/x-date-pickers\/(.+)\/index\.js$/);
        if (match) {
          const componentName = match[1];
          // Remove /index.js and map to the correct MUI v8 import path
          resource.request = `@mui/x-date-pickers/${componentName}`;
        }
      }
    )
  );
  
  // Also handle cases where it might be looking for the component without /index.js but with wrong path
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /^@mui\/x-date-pickers\/(.+)\/index$/,
      function(resource) {
        const match = resource.request.match(/^@mui\/x-date-pickers\/(.+)\/index$/);
        if (match) {
          const componentName = match[1];
          resource.request = `@mui/x-date-pickers/${componentName}`;
        }
      }
    )
  );
  
  return config;
};
