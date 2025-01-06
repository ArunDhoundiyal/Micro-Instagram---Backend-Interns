import express, {Request, Response, NextFunction} from 'express';
import { CustomRequest } from './types';
const {checkUserCredentials, loginUserCredentials} = require('./check-user-credentials')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const path = require("path");
const { open } = require("sqlite");
const server_instance = express();
const PORT = process.env.PORT || 4000;
let dataBase:any;
const dbPath = path.join(__dirname, "micro-instagram-database.db");
server_instance.use(cors());
server_instance.use(express.json());

const initialize_DataBase_and_Server = async () => {
    try {
      
      dataBase = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      server_instance.listen(PORT || 4000, () => {
        console.log(`Server is running on http://localhost:${PORT}:`);
      });
    } catch (error:any) {
      console.log(`Database Error: ${error.message}`);
      process.exit(1);
    }
  };

  initialize_DataBase_and_Server();

  interface JwtPayload {
    email: string;
    
  }
  


// Token Authorization (Middleware Function)
const authenticateToken = (
    request: CustomRequest, 
    response: Response,
    next: NextFunction
  ): void => {
    let jwtToken: string | undefined;
    const authHeader: string | undefined = request.headers["authorization"];
  
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
      if (!jwtToken) {
        response.status(401).json("Unauthorized Access Token");
      } else {
        jwt.verify(jwtToken, "MY_SECRET_TOKEN", (error: any, payload: JwtPayload) => {
          if (error) {
            response.status(403).json("Invalid Token");
          } else {
            request.email = payload.email;
            next();
          }
        });
      }
    } else {
      response.status(401).json("Authorization header missing");
    }
  };
  


 const hashPassowrd = async(password:string):Promise<string>=>{
    const saltRounds:number = 10
    return await bcrypt.hash(password, saltRounds)
 }

// User Registration 
server_instance.post('/user', async(request:Request, response:Response):Promise<any>=>{
    const {name, email, mobileNumber, password, address} = request.body
    console.log(name, email, mobileNumber, password, address)
    try {
        if (!name || !email || !mobileNumber || !password || !address){
            return response.status(400).json('All user details mandatort to give..!')
        }  
        else{
            const checkUserDetail = {user_name:name, user_email:email, user_password:password ,user_number:mobileNumber}
            const {error} = checkUserCredentials.validate(checkUserDetail)
            if (error){
                console.log(`${error.details[0].message}`);
                response.status(400).json(`${error.details[0].message}`);
            }
            else{
                const isUserExist = await dataBase.get('SELECT * FROM user WHERE email = ?', [email])
                if (isUserExist){
                    if (isUserExist.mobile_number === mobileNumber){
                        response.status(400).json(`User ${email} is already exist`);
                        console.log(`User ${email} is already exist`);
                    }
                    else{
                        response.status(400).json('Incorrect phone number..!')
                    }
                }
                
                else {
                    const userCredentialsArray: string[] = [name, email, await hashPassowrd(password),mobileNumber, address]
                    await dataBase.run('INSERT INTO user(name, email, password, mobile_number, address) VALUES (?,?,?,?,?);', userCredentialsArray)
                    response.status(200).json(`${email} as a user ${name} created successfully`);
                    console.log(`${email} as a user ${name} created successfully`);
                  }          
            } 

            }
        }
        catch (error:any) {
            response.status(500).json(`Error Message: ${error.message}`);
        }
        
    } 
)

const checkUserLoginPassword = async(plainPassword:string, hashedPassowrd:string):Promise<Boolean>=>{
    return await bcrypt.compare(plainPassword, hashedPassowrd)

 }

// User Login
server_instance.post('/auth/login', async(request:Request, response:Response):Promise<any>=>{
    const {email, mobileNumber, password} = request.body
    try {
        if (!mobileNumber || !email || !password){
            response.status(400).json('All user details are mandatory to give..!')
        }
        else{
            const checkLoginUserDetail = {user_email:email,user_password:password,user_number:mobileNumber}
            const {error} = loginUserCredentials.validate(checkLoginUserDetail)
            if (error){
                console.log(`${error.details[0].message}`);
                response.status(400).json(`${error.details[0].message}`); 
            }
            else{
                const checkLoginUser = await dataBase.get('SELECT * FROM user WHERE email = ?', [email])
                if (checkLoginUser){
                    if (checkLoginUser.mobile_number !== mobileNumber){
                        response.status(400).json('Incorrect user phone number..!')
                    }
                    else{
                        const checkLoginPassword = await checkUserLoginPassword(password, checkLoginUser.password)
                        if (checkLoginPassword){
                            const payload:object = { email: checkLoginUser.email };
                            const jwtToken:string|undefined = jwt.sign(payload, "MY_SECRET_TOKEN");
                            const tokenDetail:object = { jwt_token: jwtToken };
                            response.status(200).json(tokenDetail);
                            console.log(tokenDetail);
                        }
                        else {
                            response.status(400).json("Invalid login password");
                          }
                    }

                }
            }

        }
        
    } catch (error:any) {
        response.status(500).json(`Error while Login: ${error.message}`);
        console.log(`Error while Login: ${error.message}`);
    }

})

// Get all the posts of a user
server_instance.get('/user/posts', authenticateToken, async (request: CustomRequest, response: Response): Promise<any> => {
  try {
    const email = request.email;
    if (!email) {
      return response.status(400).json('Email is missing in the request');
    }

    const userPosts = await dataBase.all('SELECT post.id, post.title, post.description, post.images FROM post INNER JOIN user ON post.user_id = user.id WHERE user.email = ?', [email]);
    response.status(200).json(userPosts);
  } catch (error: any) {
    response.status(500).json(`Error fetching posts: ${error.message}`);
  }
});


// Get all the posts of all user
server_instance.get('/users/posts', authenticateToken, async (request: CustomRequest, response: Response): Promise<any> => {
  try {

    const userPosts = await dataBase.all('SELECT id, title, description, images FROM post');
    response.status(200).json(userPosts);
  } catch (error: any) {
    response.status(500).json(`Error fetching posts: ${error.message}`);
  }
});

// Get all the user
server_instance.get('/users', authenticateToken, async (request: CustomRequest, response: Response): Promise<any> => {
  try {

    const users = await dataBase.all('SELECT id, name, email, password, mobile_number, address, post_count FROM user');
    response.status(200).json(users);
  } catch (error: any) {
    response.status(500).json(`Error fetching posts: ${error.message}`);
  }
});

// Delete a post of user 
server_instance.delete('/user/:postId/post', authenticateToken, async (request: CustomRequest, response: Response): Promise<any> => {
  const {postId} = request.params;
  const email = request.email;
  try {
    if (!email) {
      console.log('Email is missing in the request')
      return response.status(400).json('Email is missing in the request');
    }
    if (!postId) {
      console.log("Missing post ID in path parameter..!");
      return response
        .status(400)
        .json("Missing post ID in path parameter..!");
    }
    const deleteUserPost = await dataBase.run('DELETE FROM post WHERE id IN (SELECT post.id FROM post INNER JOIN user ON post.user_id = user.id WHERE user.email = ?) AND user_id = ?', [postId, email])
    if (deleteUserPost.changes === 0) {
      console.log("No post found of the user..!");
      return response.status(404).json("No post found of the user..!");
    }

    console.log("Post deleted successfully..!");
    response.status(200).json("Post deleted successfully..!");
    
  } catch (error:any) {
    console.error(`Error-message: ${error.message}`);
    response.status(500).json(`Error-message: ${error.message}`);
    
  }

});

// Edit a post of a user 
server_instance.put(
  '/user/:postId/post',
  authenticateToken,
  async (request: CustomRequest, response: Response): Promise<any> => {
    const { postId } = request.params;
    
    const email = request.email;

    try {
      if (!email) {
        console.log('Email is missing in the request');
        return response.status(400).json('Email is missing in the request');
      }
      if (!postId) {
        console.log('Post ID is missing in the path parameter');
        return response.status(400).json('Post ID is missing in the path parameter');
      }
      const postData = await dataBase.get('SELECT * FROM post INNER JOIN user ON post.user_id = user.id WHERE post.id = ? AND user.email = ?', [postId, email]);
      if (!postData){
        console.log('No post data found..!');
        response.status(404).json('No post data found..!')
      }
      else{
        const {title = postData.title, description = postData.description, image = postData.images} = request.body;
        const updatePost = await dataBase.run('UPDATE post SET title = ?, description = ?, images = ? WHERE id = ? AND user_id = (SELECT id from user WHERE email = ?)', [title, description, image, postId, email])
        if (updatePost.changes === 0){
          response.status(404).json("Post not found or no changes made.");
        }else {
          response.status(200).json("Post updated successfully.");
        }

      }
    } catch (error:any) {
      console.error(`Error updating post: ${error.message}`);
      response.status(500).json(`Error: ${error.message}`);
    }
  }
);


// Create a post for user
server_instance.post('/user/post', authenticateToken, async (request: CustomRequest, response: Response): Promise<any> => {
  const email = request.email; 
  const { title, description, image } = request.body; 

  try {
    if (!email) {
      return response.status(400).json('Email is missing in the request');
    }

    if (!title || !description || !image) {
      return response.status(400).json('Title, description and image are required');
    }

    if (image && typeof image !== 'string') {
      return response.status(400).json('Images must be a string');
    }

    const user = await dataBase.get('SELECT id FROM user WHERE email = ?', [email]);
    
    if (!user) {
      return response.status(404).json('User not found');
    }

    await dataBase.run(
      'INSERT INTO post (user_id, title, description, images) VALUES (?, ?, ?, ?)',
      [user.id, title, description, image] 
    );

    await dataBase.run(
      'UPDATE user SET post_count = post_count + 1 WHERE id = ?',
      [user.id]
    );

    response.status(201).json('Post created successfully');

  } catch (error: any) {
    console.error(`Error creating post: ${error.message}`);
    response.status(500).json(`Error creating post: ${error.message}`);
  }
});


