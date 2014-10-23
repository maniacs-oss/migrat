var _ = require('lodash');
var assert = require('chai').assert;
var MigratReader = require('../lib/MigratReader.js');
var MigratMigration = require('../lib/MigratMigration.js');

describe('MigratReader', function() {
	describe('.file()', function() {
		it('should return an error if the file does not exist', function(done) {
			MigratReader.file(__dirname + '/fixtures/1414006573678-doesnotexist.js', function(err, migration) {
				assert.instanceOf(err, Error);
				assert.match(err.message, /Cannot find/);
				done();
			});
		});
		it('should return an error if the migration is missing an "up" method', function(done) {
			MigratReader.file(__dirname + '/fixtures/1414006573678-missing-up-method.js', function(err, migration) {
				assert.instanceOf(err, Error);
				assert.match(err.message, /missing "up"/);
				done();
			});
		});
		it('should return an error if the migration is missing an "down" method', function(done) {
			MigratReader.file(__dirname + '/fixtures/1414006573678-missing-down-method.js', function(err, migration) {
				assert.instanceOf(err, Error);
				assert.match(err.message, /missing "down"/);
				done();
			});
		});
		it('should not return an error if the migration is missing an "check" method', function(done) {
			MigratReader.file(__dirname + '/fixtures/1414006573678-missing-check-method.js', function(err, migration) {
				assert.isNull(err);
				assert.instanceOf(migration, MigratMigration);
				done();
			});
		});
		it('should return a valid MigratMigration upon success (type: once)', function(done) {
			var file = __dirname + '/fixtures/1414006573678-valid.js';
			MigratReader.file(file, function(err, migration) {
				assert.isNull(err);
				assert.instanceOf(migration, MigratMigration);
				assert.equal(migration.type, 'once');
				assert.equal(migration.name, 'valid');
				assert.equal(migration.file, file);
				assert.equal(migration.timestamp, 1414006573678);
				assert.equal(migration.filename, '1414006573678-valid.js');
				assert.isFunction(migration.methods.up);
				assert.isFunction(migration.methods.down);
				assert.isFunction(migration.methods.check);
				done();
			});
		});
		it('should return a valid MigratMigration upon success (type: all)', function(done) {
			var file = __dirname + '/fixtures/1414006573678-valid.all.js';
			MigratReader.file(file, function(err, migration) {
				assert.isNull(err);
				assert.instanceOf(migration, MigratMigration);
				assert.equal(migration.type, 'all');
				assert.equal(migration.name, 'valid');
				assert.equal(migration.file, file);
				assert.equal(migration.timestamp, 1414006573678);
				assert.equal(migration.filename, '1414006573678-valid.all.js');
				assert.isFunction(migration.methods.up);
				assert.isFunction(migration.methods.down);
				assert.isFunction(migration.methods.check);
				done();
			});
		});
	});
	describe('.dir()', function() {
		it('should return error if the folder doesn\'t exist', function(done) {
			MigratReader.dir(__dirname + '/fixtures/missing-folder', function(err) {
				assert.instanceOf(err, Error);
				assert.match(err.message, /ENOENT/);
				done();
			});
		});
		it('should return error if any of the migrations are invalid', function(done) {
			MigratReader.dir(__dirname + '/fixtures/invalid-migrations', function(err) {
				assert.instanceOf(err, Error);
				assert.match(err.message, /missing/);
				done();
			});
		});
		it('should return an error if any of the migrations have the same timestamp', function(done) {
			MigratReader.dir(__dirname + '/fixtures/duplicate-timestamps', function(err) {
				assert.instanceOf(err, Error);
				assert.match(err.message, /timestamp/);
				done();
			});
		});
		it('should return a list of migrations (order doesn\'t matter)', function(done) {
			MigratReader.dir(__dirname + '/fixtures/valid', function(err, migrations) {
				assert.isNull(err);
				assert.isArray(migrations);

				var filenames = _.pluck(migrations, 'filename');
				assert.include(filenames, '1414006573623-first.js');
				assert.include(filenames, '1414006573678-second.js');
				assert.include(filenames, '1414006573679-third.all.js');
				assert.include(filenames, '1414006573700-fourth.js');
				assert.lengthOf(migrations, 4);

				done();
			});
		});
	});
});