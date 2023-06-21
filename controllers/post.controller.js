const PostModel = require('../models/post.model');
const { uploadErrors} = require('../utils/errors.utils');

const UserModel = require('../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;

const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);





module.exports.readPost = async (req, res) => {
    try {
      const result = await PostModel.find({});
      res.status(200).json({ docs: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Failed to retrieve data" });
    }
  };
  

module.exports.createPost = async (req, res) => {
    console.log("req.file : " , req.file)
    console.log("test 000")
    let fileName;
    if (req.file !== null) {
        console.log("test 1")
        try {
            // if (
            //     req.file.detectedMimeType !== "image/jpg" &&
            //     req.file.detectedMimeType !== "image/png" && 
            //     req.file.detectedMimeType !== "image/jpeg" 
            // )
            // throw Error("invalid file");
            console.log("test 2")
            if (req.file.size > 900000)  throw Error("max size");
        } catch (err) {
            console.log("err : ", err)
            const errors = uploadErrors(err);
            return res.status(201).json(errors);
        }
        console.log("test 223")
          fileName = req.body.posterId + Date.now() + '.jpg';
          console.log("filename : " , fileName)
          await pipeline(
            // console.log('test stream'),
            req.file.stream,
            // console.log('test stream : ',req.file.stream),
            fs.createWriteStream(
              `${__dirname}/../client/public/uploads/posts/${fileName}`
            )
          );
    };
    console.log("test 2121")

    const newPost = new PostModel({
        postId: req.body.posterId,
        message: req.body.message,
        picture: req.file !== null ? "./uploads/posts/" + fileName : "" ,
        video: req.body.vidio,
        likers: [],
        comments: [],
    });
    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).send(err);
    }
    
};

module.exports.updatePost = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

    const updatedRecord ={
        message: req.body.message
    }
    PostModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("update error : " + err);
        }
    )
    
}
module.exports.deletePost = async(req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);
         await PostModel.findByIdAndRemove(req.params.id)
         
    } catch (error) {
        console.log("Delete error : " + error);
    }
  };

module.exports.likePost = async (req, res) => {
    if (!ObjectId.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: { likers: req.body.id },
        },
        { new: true })
        .then((data) => res.send(data))
        .catch((err) => res.status(500).send({ message: err }));
  
      await UserModel.findByIdAndUpdate(
        req.body.id,
        {
          $addToSet: { likes: req.params.id },
        },
        { new: true })
              .then((data) => res.send(data))
              .catch((err) => res.status(500).send({ message: err }));
      } catch (err) {
          return res.status(400).send(err);
      }
  };
  
  module.exports.unlikePost =  async (req, res) => {
    if (!ObjectId.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id) ;


    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id}
            },
            { new: true }, 
            (err, docs) => {
                if (err) return res.status(400).send(err);
            }

        );
        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id}

            },
            { new: true},
            (err, docs) => {
                if(!err) res.send(docs);
                else return res.status(400).send(err);
            }
        );
     } catch (err) {
        return res.status(400).send(err);
     }


};

module.exports.commentPost = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      return PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              commenterPseudo: req.body.commenterPseudo,
              text: req.body.text,
              timestamp: new Date().getTime(),
            },
          },
        },
        { new: true })
              .then((data) => res.send(data))
              .catch((err) => res.status(500).send({ message: err }));
      } catch (err) {
          return res.status(400).send(err);
      }
  };
  

// module.exports.commentPost = (req, res) => {
//     if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send('ID unknown : ' + req.params.id) ;


//     try {
//         return PostModel.findByIdAndUpdate(
//             req.params.id,
//             {
//                 $push: {
//                     comments: {
//                         commenterId: req.body.commenterId,
//                     commenterPseudo: req.body.commenterPseudo,
//                     text: req.body.text,
//                     timestamp: new Date().getTime()
//                     },
//                 },
//             },
//             {
//             new: true
//             },
//             (err, docs) => {
//                 if(!err) return res.send(docs);
//                 else return res.status(400).send(err);
//             }
//         );
//         } catch (err) {
//             return res.status(400).send(err);
//         }

// };
module.exports.editCommentPost = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id) ;

    try {
        return PostModel.findById(
            req.params.id,
            (err, docs) =>{
                const theComment = docs.comments.find((comment) => 
                    comment._id.equals(req.body.commentId)
                )


                if (!theComment) return res.status(404).send('comment not found')
                theComment.text = req.body.text;

                return docs.save((err) => {
                    if (!err) res.status(200).send(docs);
                    return res.status(500).send(err);
                } )
            }
        )
        
    } catch (err) {
        return res.status(400).send(err);
    }
};
module.exports.deleteCommentPost = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id) ;


    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
};


