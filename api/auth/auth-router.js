const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const Users = require('./auth-model');

const authenticate = require('./authenticate-mw')
const secrets = require('../../data/config/secret');
const itemsModel = require('../items/items-model');

router.get('/', (req, res) => {
  Users.find()
      .then(users => {
          res.status(200).json(users);
      })
      .catch(err => {
          res.status(500).json({ message: `failed to get users - ${err}` })
      })
})

router.get('/:id', (req, res) => {
  Users.findById(req.params.id)
      .then(user => {
          res.status(200).json(user);
      })
      .catch(err => {
          res.status(500).json({ message: `unable to get user - ${err}` })
      })
})

router.post('/register', (req, res) => {
  // implement registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      const token = generateToken(user);
      res.status(201).json({message: 'register success'});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({error: error, errorMessage: error.message});
    })
});

router.post('/login', (req, res) => {
  let {username, password} = req.body;
  Users.findBy({username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({token: token});
      } else {
        res.status(401).json({message: 'Invalid Credentials'});
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json(error);
    })
});

router.put('/becomeSeller', authenticate, (req, res) => {
  Users.update({userRole: 'seller'}, req.decodedToken.user.id)
    .then(user => {
      res.status(200).json(user)
    })
    .catch(err => {
      res.status(500).json({ message: `unable to update role - ${err}` })
    })
})

function generateToken(user) {
  const payload = {
    user: user,
    userid: user.id
  };
  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
};

module.exports = router;
