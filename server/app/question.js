import { Router } from 'express'
import { pool } from '../util/db.js'

const question = Router()

//get question
question.get('/', async (req, res) => {
    try{
        if(req.query.title){
            const data = await pool.query(`select * from question 
            where title like $1`, [req.query.title+'%'])
            return res.json({
                data : data.rows[0]
            })
        } else if(req.query.content){
            const data = await pool.query(`select * from question where content like $1`, [req.query.content+'%'])
            return res.json({
                data : data.rows[0]
            })
        } else if(req.query.category){
            let numCategory;
            let category = req.query.category.toLocaleLowerCase()
            category === "software" ? numCategory = 1 
            : category === "food" ? numCategory = 2 
            : category === "travel" ? numCategory = 3
            : category === "science" ? numCategory = 4
            : category === "etc" ? numCategory = 5 : null
            const data = await pool.query(`select * from question where category_id = $1`, [numCategory])
            return res.json({
                data : data.rows[0]
            })
        }

        const data = await pool.query(`select * from question`)
    
        res.status(200).json({
            data : data.rows
        })
    } catch(err){
        throw(err)
    }
})

question.get('/:questionId', async ( req , res ) => {
    try{

        const getAllQuestion = await pool.query(`select * from question where question_id = $1`, [req.params.questionId])
    
        return res.json({
            data : getAllQuestion.rows[0]
        })
        
    }catch(err){
        return res.json({
            msg : "question not found"
        })
    }

})

question.get('/:questionId/vote', async (req, res) => {
    try{
        
        if(req.query.userId){
            const getquestionVoteByUserId = await pool.query(`select * from question_vote 
            where question_id = $1 
            and user_id = $2`, [ req.params.questionId, req.query.userId ])
            return res.json({
                data : getquestionVoteByUserId.rows[0]
            })
        } else {
            const getQuestionVote = await pool.query(`select * from question_vote where question_id = $1`, [ req.params.questionId ])
            return res.json({
                data : getQuestionVote.rows
            })
        }
    } catch(err){
        throw(err)
    }

})

//Post Question
question.post('/', async(req, res) => {
    try{

        await pool.query(
            `insert into question(category_id, user_id, title, content, created_at, updated_at)
            values($1, $2, $3, $4, $5, $6)
        `, [ 
            req.body.category_id,
            req.body.user_id,
            req.body.title,
            req.body.content,
            new Date(),
            new Date()
         ])
    
         res.status(201).json({
            msg : "question posted"
         })
    } catch(err){
        res.json({
            msg : "input invalid"
        })
    }

})

//Edit Question
question.put('/:questionId', async (req, res) => {
    try{

        await pool.query(`update question 
            set category_id = $1, title = $2, content = $3, updated_at = $4
            where question_id = $5`, 
            [ req.body.category_id, req.body.title, req.body.content , new Date(), req.params.questionId]
            )
    
        return res.json({
            msg : "question has been updated"
        })
        
    } catch(err){
        res.json({
            msg : `question not found`
        })
        throw(err)
    }
})


//Vote to Question
question.post('/:questionId/vote',async (req, res) => {
    try{
        const hasData = await pool.query(`select * from question_vote where question_id = $1 and user_id = $2`, [ req.params.questionId, req.body.user_id ])
        const isUndefined = hasData.rows[0] === undefined
    
        if(isUndefined){
            pool.query(`update question_vote 
            set vote_id = $1
            where user_id = $2
            and question_id = $3`, [ req.body.vote_id, req.body.user_id, req.params.questionId ])
            return res.status(202).json({
                msg : "vote has been updated"
            })
        } else {
            await pool.query(`insert into question_vote(user_id, question_id, vote_id)
            values ( $1, $2, $3 )`, [ req.body.user_id, req.params.questionId, req.body.vote_id ])
            return res.status(201).json({
                msg : "question vote success!"
            })
        }
    } catch(err){
        return res.status(400).json({
            msg : "invalid input"
        })
    }
})

//get answer from question
question.get('/:questionId/answer', async (req, res) => {
    try{
        if (req.query.answerId){
            const data = await pool.query(`select * from answer where question_id = $1 and answer_id = $2`, [ req.params.questionId, req.query.answerId ])
            return res.json({
                data : data.rows[0]
            })
        }

        const data = await pool.query(`select * from answer where question_id = $1`, [ req.params.questionId ])
        return res.json({
            data : data.rows
        })
    }catch(err){
        return res.status(400).json({
            msg : "invalid input"
        })
    }
})

//create answer
question.post('/:questionId/answer', async ( req, res ) => {
    try{
        await pool.query(`insert into answer(
            question_id,
            user_id,
            content,
            video_url,
            image_url,
            created_at,
            updated_at
        ) values(
            $1, $2, $3, $4, $5, $6, $7
        )`, [
            req.params.questionId,
            req.body.user_id,
            req.body.content,
            req.body.video_url,
            req.body.image_url,
            new Date(),
            new Date()
        ])

        return res.status(201).json({
            msg : "answer has been created"
        })
    }catch(err){
        return res.status(400).json({
            msg : "invalid input"
        })
    }
})

//edit answer
question.put('/:questionId/answer/:answerId', async (req, res) => {
    try{
        await pool.query(`update table
            set content = $1,
            video_url = $2,
            image_url = $3,
            updated_at = $4
            where answer_id = $4
        `, [ 
            req.body.content,
            req.body.video_url,
            req.body.image_url,
            new Date()
         ])

         return res.status(200).json({
            msg : "answer has been updated"
         })
    }catch(err){
        return res.json({
            msg : "invalid input"
        })
    }
})

//vote to answer
question.post('/:questionId/answer/:answerId', async(req, res) => {
    try{
        const hasData = await pool.query(`select * from answer_vote where user_id = $1 and answer_id = $2`, [ req.body.user_id, req.params.answerId ])
        if(hasData.rows[0] !== undefined){
            await pool.query(`update answer_vote
                set vote_id = $1
            `, [req.body.vote_id])
            
            return res.status(200).json({
                msg : `vote to answer ${req.params.answerId} has been update`
            })
        }

        await pool.query(`insert into answer_vote(user_id, answer_id, vote_id)
            values($1, $2, $3)
        `, [ 
            req.body.user_id,
            req.params.answerId,
            req.body.vote_id
         ])

         return res.json({
            msg : "answer vote has been added"
         })

        
    }catch(err){
        return res.status(400).json({
            msg : "invalid input"
        })
    }
})


//delete question
question.delete('/:questionId', async( req, res ) => {
    try{
        await pool.query(`delete from question where question_id = $1`, [ req.params.questionId ])
    
        return res.status(200).json({
            msg : `question has been deleted`
        })
    } catch(err){
        return res.status(400).json({
            msg : "invalid input"
        })
    }
})












export default question