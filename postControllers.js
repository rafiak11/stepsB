const Post = require('../models/postModel')
const User = require("../models/userModel")
const path = require('path')
const fs= require('fs')
const{ v4: uuid}= require('uuid')
const HttpError= require('../models/errorModels')
const mongoose = require('mongoose');


//==========create a post
//POST: api/posts
//Protected
const createPost = async(req, res, next)=> { 
    try{ 
        let { title, category, description} =req.body; 
        if(!title || !category || !description){ 
            return next(new HttpError("Fill in all details and choose thumbnail. ", 422))

        } 
        const { thumbnail } = req.files; 
        //check the file size
        if(thumbnail.size > 2000000){ 
            return next(new HttpError("Thumbnail is too big. File should be less than 2MB"))

        }
        let fileName = thumbnail.name; 
        let splittedFilename=  fileName.split('.')
        let newFilename= splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length-1]
         thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async(err) => { 
            if(err){ 
                return next(new HttpError(err))
            } else{ 
                const newPost= await Post.create({title, category, description, thumbnail: newFilename,
                    creator: req.user.id})
                    if(!newPost){ 
                        return next(new HttpError("Post couldn't be created.", 422))
                    }
                    //find user and increate post count by 1
                    const currentUser = await User.findById(req.user.id);
                    const userPostCount= currentUser.posts +1; 
                    await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})

                    res.status(201).json(newPost)
                }
            }
         )

    } catch(error){ 
        return next(new HttpError(error))

    }
}

//==========get all posts
//GET : api/posts/:id
//UnProtected
const getPosts = async(req, res, next)=> { 
    try{
        const posts= await Post.find().sort({updatedAt: -1})
        res.status(200).json(posts) 

    }catch(error){ 
        return next(new HttpError(error))
    }
}

//==========get a single post
//GET : api/posts/categories/:category
//Protected
const getPost = async(req, res, next)=> { 
    try{ 
        const postId= req.params.id;
        const post= await Post.findById(postId); 
        if(!post){ 
            return next(new HttpError("Post not Found. ", 404))
        }
        res.status(200).json(post)

    } catch(error){ 
        return next(new HttpError(error))
    }
}

//==========get post by category
//POST: api/posts
//Protected
const getCatPosts = async(req, res, next)=> { 
    try{ 
        const {category}=req.params;
        const catPosts =await Post.find({category}).sort({createdAt: -1})
        res.status(200).json(catPosts) 

    }catch(error){ 
        return next(new HttpError(error))

    }
}

//==========get author post
//GET: api/posts/user/:id
//UnProtected
const getUserPosts= async(req, res, next)=> { 
    try{
        const {id} = req.params; 
        const posts = await Post.find({creator: id}).sort({createdAt:-1})
        res.status(200).json(posts) 

    }catch(error){ 
        return next(new HttpError(error))
    }
}

//==========edit post
//PATCH: api/posts/:id
//Protected
const editPost= async(req, res, next)=> {
    try{ 
        let fileName; 
        let newFilename; 
        let updatedPost; 
        const postId= req.params.id;
        let{title, category, description}=req.body; 
        if(!title || !category || description.length < 12){ 
            return next(new HttpError("Fill in all details. ", 422))
        }
        if(!req.files){ 
            updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description}, {new:true})
        }else{ 
            //get old post from database
            const oldPost= await Post.findById(postId); 
            //delete old thumbnail from upload
            fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async(err) => { 
                if(err){ 
                    return next(new HttpError(err))
                }
                
                })
                //upload thumbnail
                const {thumbnail} =req.files; 
                //check file size 
                if(thumbnail.size > 2000000){ 
                    return next(new HttpError("Thumbnail too big. Should be less than 2MB."))
                }
                fileName = thumbnail.name; 
                let splittedFilename= fileName.split('.')
                newFilename = splittedFilename[0] + uuid() +"."+ splittedFilename[splittedFilename.length -1]
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async(err) =>{ 
                    if(err){ 
                        return next(new HttpError(error))
                    }
                }) 
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description, thumbnail: newFilename}, 
                    {new: true})
    
            
        }

    if(!updatedPost){ 
        return next(new HttpError("Couldnot update post.", 400))
    }  
    res.status(200).json(updatedPost)  
    }catch(error){ 
        return next(new HttpError(error))
    }
} 

//==========delete post
//DELETE: api/posts/:id
//Protected
const deletePost= async(req, res, next)=> { 
    try{ 
        const postId=req.params.id; 
        if(!postId){ 
            return next(new HttpError("Post unavailable.", 400))
        } 

        const post= await Post.findById(postId);  
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }
        const fileName= post?.thumbnail;  
        if(req.user.id == post.creator){
         //delete thumbnail from upload folder
         fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async(err) => { 
            if(err){ 
                return next(new HttpError(err))
            }else{ 
                await Post.findByIdAndDelete(postId); 
                //find user and reduce post count by 1 
                const currentUser= await User.findById(req.user.id); 
                const userPostCount= currentUser?.posts-1; 
                await User.findByIdAndUpdate(req.user.id, {posts:userPostCount })
                res.json(`Post ${postId} deleted succcessfully.`)
            }
    })
}else{ 
    return next(new HttpError("Post couldn't be deleted.", 403))
}


    }catch{ 
        return next(new HttpError(error))
    }
}


const Comment = require('../models/commentModel');

// Add Comment
const addComment = async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      console.log('Post ID:', id);
      console.log('Comment text:', text);

      if (!text) {
        return res.status(400).json({ message: 'Comment text is required' });
      }
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
  
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const comment = new Comment({ post: id, text });
      await comment.save();
  
      post.comments.push(comment._id); // Push the new comment ID to the comments array
      await post.save();
  
      res.status(201).json(comment);
    } catch (error) {
        console.error('Error in addComment:', error);
      res.status(500).json({ message: 'Error adding comment', error });
    }
  };
  
  
  // Get Comments
  const getComments = async (req, res) => {
    try {
      const { id } = req.params; // Post ID from the URL
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('Validation failed: Invalid post ID');
        return res.status(400).json({ message: 'Invalid post ID' });
      }
  
      // Fetch comments
      const comments = await Comment.find({ post: id });
      console.log('Fetched comments:', comments);
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Error fetching comments', error });
    }
  };
  


module.exports = { createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost, addComment, getComments };




