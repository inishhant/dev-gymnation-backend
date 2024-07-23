// it handle all async methods

// type 1 using promise
const asyncHandler = (requestHandler) => {
  return (req,res,next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((err) => {
        next(err)
    })
  }
}
export { asyncHandler }

// type 2 using try and catch
// const asyncHandler = (fun) = async (req,res,next) => {
//    try {
//     await fun(req,res,next)
//    } catch(err) {
//     next(err)
//    }
// }
