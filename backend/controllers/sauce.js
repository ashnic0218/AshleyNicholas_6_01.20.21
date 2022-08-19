const Sauce = require('../models/sauce');
const fs = require('fs');


exports.createSauce = (req, res, next) => { // creating new sauces added in add sauce
    req.body.sauce = JSON.parse(req.body.sauce);
    const url = req.protocol + '://' + req.get('host');
    // console.log('req.body.sauce', req.body.sauce);
    console.log('req.body.sauce', req.body.sauce);
    const sauce = new Sauce({
      name: req.body.sauce.name,
      description: req.body.sauce.description,
      imageUrl: url + '/images/' + req.file.filename,
      manufacturer: req.body.sauce.manufacturer,
      mainPepper: req.body.sauce.mainPepper,
      heat: req.body.sauce.heat,
      userId: req.body.sauce.userId,
      likes: 0,
      dislikes: 0,
      usersLiked: req.body.sauce.usersLiked,
      usersDisliked: req.body.sauce.usersDisliked
    });
    sauce.save().then(
      () => {
        res.status(201).json({
          message: 'Post saved successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
};

exports.getOneSauce = (req, res, next) => { // locates one sauce to be able to look at entry on website
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  let sauce = new Sauce({ _id: req.params._id });
  
  if (req.file) { // checking what was updated
      Sauce.findOne({ // using find one to isolate the sauce user wants to change
          _id: req.params.id
      }).then((data) => {
          console.log(data) // to change image file
          const originalFilename = data.imageUrl.split('/images/')[1]
          fs.unlink('images/' + originalFilename, () => {
              console.log('Removed old image')
          })
      })
          
      const url = req.protocol + '://' + req.get('host');
      req.body.sauce = JSON.parse(req.body.sauce);
      sauce = {
          _id: req.params.id,
          // userId: req.body.sauce.userId,
          name: req.body.sauce.name, // to change any other information about the sauce
          manufacturer: req.body.sauce.manufacturer,
          description: req.body.sauce.description,
          mainPepper: req.body.sauce.mainPepper,
          imageUrl: url + '/images/' + req.file.filename,
          heat: req.body.sauce.heat,
      };
  } else { // leaves things unchanged if unchanged and updates to new sauce
      
      sauce = {
          _id: req.params.id,
          userId: req.body.userId,
          name: req.body.name,
          manufacturer: req.body.manufacturer,
          description: req.body.description,
          mainPepper: req.body.mainPepper,
          imageUrl: req.body.imageUrl,
          heat: req.body.heat,
      };
  }
  Sauce.updateOne({_id: req.params.id}, sauce).then( // updates sauce and rewrites the entry in the database
      () => {
      res.status(201).json({
          message: 'Sauce updated successfully!'
      });
      }
  ).catch(
      (error) => {
      res.status(400).json({
          error: error
      });
      }
  );
};

exports.deleteSauce = (req, res, next) => { // removes current selected sauce from database
    Sauce.findOne({_id: req.params.id}).then(
      (sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink('images/' + filename, () => {
          Sauce.deleteOne({_id: req.params.id}).then(
            () => {
              res.status(200).json({
                message: 'Deleted!'
              });
            }
          ).catch(
            (error) => {
              res.status(400).json({
                error: error
              });
            }
          );
        });
      }
    );
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      console.log("ERROR");
      res.status(400).json({
        error: error + "test"
      });
    }
  );
};

exports.getLikes = (req, res, next) => {
  // find the sauce using Sauce.findOne()
  // use a conditional that lets me know which thumb has been clicked using req.body.like that will give a number (1, -1, 0)
  console.log(req.body);
      Sauce.findOne({_id: req.params.id}).then( // which sauce am I working with
          (sauce) => {

              const sauceUpdate = {
                  likes: sauce.likes,
                  dislikes: sauce.dislikes,
                  usersLiked: sauce.usersLiked,
                  usersDisliked: sauce.usersDisliked
              }

              console.log(sauce)
              if (req.body.like === 1) {
                  
                  // If req.body === 1 -> update amount of likes
                  // add userId to usersLiked array
                  
                  if (!sauceUpdate.usersLiked.includes(req.body.userId)) {
                      sauceUpdate.usersLiked.push(req.body.userId)
                      sauceUpdate.likes += 1
                      console.log(sauceUpdate)
                  }
                           // object I am using to update the record
              } else if (req.body.like === -1) {
                  console.log(sauceUpdate)

                  if (!sauceUpdate.usersDisliked.includes(req.body.userId)) {
                      sauceUpdate.usersDisliked.push(req.body.userId)
                      sauceUpdate.dislikes += 1
                      console.log(sauceUpdate)
                  }

              }  else if (req.body.like === 0 && sauce.usersLiked.some(user => user === req.body.userId)) {
                  // delete userId from usersLiked array and subtract 1 form likes array
                  // some returns a true or false to see if user id is in array

                  if (sauceUpdate.likes > 0) { // to ensure we don't get negative numbers due to double userid although this should not happen. Example of putting a test safety in code
                      sauceUpdate.likes -= 1
                      const userIndex = sauceUpdate.usersLiked.findIndex(user => user === req.body.userId) //find index will return the first instance of the user id that is in the array
                      sauceUpdate.usersLiked.splice(userIndex, 1) //splice removes that instance
                      console.log({'from like to 0': sauceUpdate})
                  }

                  
              } else if (req.body.like === 0 && sauce.usersDisliked.some((user) => req.body.userId === user)) {
                  // delete userId from usersDisliked array and subtract 1 from dislikes

                  if (sauceUpdate.dislikes > 0) {
                      sauceUpdate.dislikes -= 1
                      const userIndex = sauceUpdate.usersDisliked.findIndex(user => req.body.userId === user)
                      sauceUpdate.usersDisliked.splice(userIndex, 1)
                      console.log({'from dislike to 0': sauceUpdate})
                  }
              }

          Sauce.updateOne({_id: req.params.id}, sauceUpdate) // updates amount of likes on sauce
          .then(() => {
              res.status(201).json({
                  message: 'We hear you!'
          });
          })
          .catch(
              (error) => {
              res.status(400).json({
                  error: error
              });
          }
      );
  }
)}
