{
    const rewire = require('rewire');
    const should = require('should');
    const sinon = require('sinon');
    const assert = require('assert');
    const fs = require('fs');

    const dsmGithub = rewire('./dsm-github.js');

    _stubEventGetRequest = () => {
        const request = require('es6-request');
        const getStub = sinon.stub();

        getStub.withArgs(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/1/_data/events.yml`)
        .returns(new Promise((fulfill, reject) => {
            fulfill([fs.readFileSync('./test_data/events1.yml')]);
        }));
        getStub.withArgs(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/2/_data/events.yml`)
        .returns(new Promise((fulfill, reject) => {
            fulfill([fs.readFileSync('./test_data/events2.yml')]);
        }));
        getStub.withArgs(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/3/_data/events.yml`)
        .returns(new Promise((fulfill, reject) => {
            fulfill([fs.readFileSync('./test_data/events3.yml')]);
        }));
        getStub.withArgs(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/4/_data/events.yml`)
        .returns(new Promise((fulfill, reject) => {
            fulfill([fs.readFileSync('./test_data/events4.yml')]);
        }));
        getStub.withArgs(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/5/_data/events.yml`)
        .returns(new Promise((fulfill, reject) => {
            fulfill([fs.readFileSync('./test_data/events5.yml')]);
        }));

        sinon.stub(request, "get", getStub);
    };

    describe('DSM Github helper', () => {
        before(() => {
            _stubEventGetRequest();
        });

        it('should correctly determine if two objects are equal', (done) => {
            const objectsAreEqual = dsmGithub.__get__('_objectsAreEqual');
            let obj1, obj2;

            obj1 = { a: 1, b: 2, c: 3 };
            obj2 = { a: 1, b: 2, c: 3 };
            should(objectsAreEqual(obj1, obj2)).equal(true);
            should(objectsAreEqual(obj2, obj1)).equal(true);

            obj1 = { a: 1, b: 2 };
            obj2 = { a: 1, b: 1 };
            should(objectsAreEqual(obj1, obj2)).equal(false);
            should(objectsAreEqual(obj2, obj1)).equal(false);

            done();
        });

        it('should parse yaml retrieved from Github', (done) => {
            dsmGithub.getEntries('1', '_data/events.yml')
            .then((entries) => {
                should(entries.length).equal(1);
                const entry = entries[0];
                entry.should.have.property('title', 'A');
                entry.should.have.property('group', 'Group who is hosting');
                entry.should.have.property('location', 'Name of the location');
                entry.should.have.property('details_url', 'URL to additional details');
                entry.should.have.property('date', 'June 23');
                entry.should.have.property('time', '5:00pm - 6:00pm');
            });
            done();
        });

        it('should return an array with one entry if one entry is added', (done) => {
            dsmGithub.getNewEntries(
                {
                    body: {
                        before: 1,
                        after: 2
                    },
                },
                '_data/events.yml')
            .then((newEntries) => {
                should(newEntries.length).equal(1);
                const entry = newEntries[0];
                entry.should.have.property('title', 'B');
                entry.should.have.property('group', 'Group who is hosting');
                entry.should.have.property('location', 'Name of the location');
                entry.should.have.property('details_url', 'URL to additional details');
                entry.should.have.property('date', 'June 23');
                entry.should.have.property('time', '5:00pm - 6:00pm');
            });

            dsmGithub.getNewEntries(
                {
                    body: {
                        before: 3,
                        after: 4
                    },
                },
                '_data/events.yml')
            .then((newEntries) => {
                should(newEntries.length).equal(4);
                for(let i = 0; i < 4; i++) {
                    const entry = newEntries[i];
                    entry.should.have.property('title', ['A', 'B', 'C', 'D'][i]);
                    entry.should.have.property('group', 'Group who is hosting');
                    entry.should.have.property('location', 'Name of the location');
                    entry.should.have.property('details_url', 'URL to additional details');
                    entry.should.have.property('date', 'June 23');
                    entry.should.have.property('time', '5:00pm - 6:00pm');
                }
            });

            dsmGithub.getNewEntries(
                {
                    body: {
                        before: 3,
                        after: 4
                    },
                },
                '_data/events.yml')
            .then((newEntries) => {
                should(newEntries.length).equal(4);
                for(let i = 0; i < 4; i++) {
                    const entry = newEntries[i];
                    entry.should.have.property('title', ['A', 'B', 'C', 'D'][i]);
                    entry.should.have.property('group', 'Group who is hosting');
                    entry.should.have.property('location', 'Name of the location');
                    entry.should.have.property('details_url', 'URL to additional details');
                    entry.should.have.property('date', 'June 23');
                    entry.should.have.property('time', '5:00pm - 6:00pm');
                }
            });
            done();
        });

        it('should return an array with zero entries if no entries were added', (done) => {
            dsmGithub.getNewEntries(
                {
                    body: {
                        before: 2,
                        after: 1
                    },
                },
                '_data/events.yml')
            .then((newEntries) => {
                should(newEntries.length).equal(0);
            });
            done();
        });

        it('should return an array with one entry if one entry is added and one is removed', (done) => {
            dsmGithub.getNewEntries(
                {
                    body: {
                        before: 1,
                        after: 5
                    },
                },
                '_data/events.yml')
            .then((newEntries) => {
                should(newEntries.length).equal(1);
                const entry = newEntries[0];
                entry.should.have.property('title', 'E');
                entry.should.have.property('group', 'Group who is hosting');
                entry.should.have.property('location', 'Name of the location');
                entry.should.have.property('details_url', 'URL to additional details');
                entry.should.have.property('date', 'June 23');
                entry.should.have.property('time', '5:00pm - 6:00pm');
            });
            done();
        });

        it('should output the correct error when webhook data is invalid', (done) => {
            dsmGithub.getNewEntries({}, '_data/events.yml')
            .catch((err) => {
                should(err).equal('Request is missing body.before and/or body.after commit hashes');
            });

            dsmGithub.getNewEntries({body: {}}, '_data/events.yml')
            .catch((err) => {
                should(err).equal('Request is missing body.before and/or body.after commit hashes');
            });

            dsmGithub.getNewEntries({body: {after: '1'}}, '_data/events.yml')
            .catch((err) => {
                should(err).equal('Request is missing body.before and/or body.after commit hashes');
            });

            dsmGithub.getNewEntries({body: {before: '1'}}, '_data/events.yml')
            .catch((err) => {
                should(err).equal('Request is missing body.before and/or body.after commit hashes');
            });
            done();
        });
    });
}