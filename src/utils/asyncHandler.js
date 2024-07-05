const asyncHandler = (requestHandler) =>{
    return (req,res,next)=>{     //We have return it also 
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=> next(err))
    }
}

export {asyncHandler}



//using higher order function which accept function as a paarmeter in other function

// const asyncHandler = () =>{}
// const asyncHandler = (func) => {()=>{}} //here bracket can be removed also
// const asyncHandler = (func) => async()=>{}


    //WRAPPER FUNCTION BRO
    // const asyncHandler = (fn) => async(req,res,next) =>{
    //     try{
    //         await fn(req,res,next)
    //     }catch(error){
    //         res.status(err.code || 500).json({
    //             success:false,
    //             message:err.message
    //         })
    //     }

    // }
