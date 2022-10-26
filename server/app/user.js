import { pool } from '../util/db.js'
import { Router } from 'express'
import bcrypt from 'bcrypt'


const user = Router()

user.get('/', async(req,res) => {
    const response = await pool.query(`select * from users`)
    return res.json({
        data : response.rows
    })
})

user.post('/createuser', async( req, res ) => {

    try{
        const hasUser = await pool.query(`select username from users where username = $1`, [ req.body.username ])
        if(hasUser.rows[0] !== undefined){
            return res.json({
                msg : "username has already exist"
            })
        }
        
        const encryptedPass = await bcrypt.hash(req.body.password, (10))

        const users =  await pool.query(
            `insert into users(username, password)
            values($1, $2) returning *`, [req.body.username, encryptedPass]
            )
    
        await pool.query(`insert into user_profile (user_id, first_name, last_name, age, email)
        values ($1, $2, $3, $4, $5)`, [users.rows[0].user_id, req.body.firstName, req.body.lastName, req.body.age, req.body.email])
        
    
        res.json({
            msg : "user has been created"
        })
    }catch(err){
        throw(err)
    }
    
})

export default user