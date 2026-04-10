export default {
  paths: ['tests/bdd/features/*.feature'],
  require: ['tests/bdd/steps/*.js'],
  format: ['progress', 'html:tests/bdd/reports/cucumber-report.html'],
  publishQuiet: true,
};
