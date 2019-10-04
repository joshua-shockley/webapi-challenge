const express = require('express');
const helmet = require('helmet');

const Projects = require('./data/helpers/projectModel.js');
const Actions = require('./data/helpers/actionModel.js');

const server = express();

server.get('/', (req, res) => {
    res.send(`<h2> now we see something working... good. move to the next</h2>`)
});

//make my logger middleware so i can see whats happening
function logger(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);
    next();
};

server.use(logger);
server.use(helmet());
server.use(express.json());


//setup the api's here PROJECTS
server.get('/projects', (req, res) => {
    Projects.get()
        .then(project => {
            res.status(200).json(project);
        })
        .catch(error => {
            res.status(500).json({ Message: "cant find projects" });
        });
});

server.post('/projects', (req, res) => {
    const projectData = req.body;
    Projects.insert(projectData)
        .then(project => {
            res.status(201).json(project)
        })
        .catch(error => {
            res.status(500).json({ Message: 'unable to add project' });
        });
});

// below gets all of project info including the array of actions that belong to it
server.get('/projects/:id', ValidId, (req, res) => {
    const id = req.params.id;
    Projects.get(id)
        .then(project => {
            res.status(200).json(project);
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ Error: 'Cannot get resource' });
        });
});

server.put('/projects/:id', ValidId, (req, res) => {
    const id = req.params.id;
    const changes = req.body;
    Projects.update(id, changes)
        .then(project => {
            res.status(201).json(project);
        })
        .catch(error => {
            res.status(500).json({ Message: 'unable to update project' });
        });
});

server.delete('/projects/:id', ValidId, (req, res) => {
    const id = req.params.id;
    Projects.remove(id)
        .then(project => {
            res.status(200).json(project);
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ Error: 'Cannot delete project' });
        });
});

//trying out the other api end point to get project's actions
server.get('/projects/:id/actions', ValidId, (req, res) => {
    const id = req.params.id;
    Projects.getProjectActions(id)
        .then(projectA => {
            res.status(200).json(projectA);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ Message: 'cannot get the actions' });
        });
});


//setup the api's here ACTIONS
server.get('/actions', (req, res) => {
    Actions.get()
        .then(actions => {
            console.log(actions);
            res.status(200).json(actions);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ Message: 'unable to retrieve actions' });
        });
});
//posts a new action project_id is part of req.body
server.post('/projects/:id/actions', ValidId, validPojectId, (req, res) => {
    const actionData = req.body;
    Actions.insert(actionData)
        .then(actions => {
            res.status(201).json(actions);
        })
        .catch(error => {
            res.status(500).json({ Message: "cant add action" });
        });
});
//gets individual action
server.get('/actions/:id', ValidId, (req, res) => {
    const id = req.params.id;
    Actions.get(id)
        .then(action => {
            res.status(200).json(action);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ Message: 'cant get action' });
        });
});

server.put('/actions/:id', ValidId, (req, res) => {
    const id = req.params.id;
    const changes = req.body;
    Actions.update(id, changes)
        .then(action => {
            res.status(201).json(action);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ Message: 'unable to update action' });
        });
});

server.delete('/actions/:id', ValidId, (req, res) => {
    const id = req.params.id;
    Actions.remove(id)
        .then(action => {
            res.status(200).json({ Message: 'action removed' });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ Message: 'unable to remove action' });
        });
});

//if i use router put them here
// server.use('the url', router name from up top);
// place middleware here also if i dont want to import them..
function validPojectId(req, res, next) {
    const projectId = req.body.project_id;
    const id = req.params.id;
    Projects.get(id)
        .then(thing => {
            if (projectId !== thing.id) {
                res.status(404).json({ Message: 'not using proper id number' });
            } else {
                console.log(projectId);
                req.project = thing;
                next();
            };
        })


};

function ValidId(req, res, next) {
    const id = req.params.id;
    Projects.get(id)
        .then(thing => {
            if (!thing) {
                res.status(404).json({ Message: 'nothing using that id' });
            } else {
                console.log(id);
                req.project = thing;
                next();
            };
        })
};



module.exports = server;