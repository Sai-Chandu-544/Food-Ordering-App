const express=require("express");
const router=express.Router();

const middleware=require("./../middleware/middleware.js")
const {register,login,logout,user_menu,user_item,item_category,user_cusine,place_orders,get_user_orders}=require("./../controllers/user_logic");
router.post("/register",register)
router.post("/login",login)
router.get("/logout",logout)
router.get("/menu",middleware,user_menu)
router.get("/menu/:item",middleware,user_item)
router.get("/list/:item_type",middleware,item_category)
router.get("/cusine/:cusine",middleware,user_cusine)
router.post("/place/orders",middleware,place_orders)
router.get("/orders",middleware,get_user_orders)



module.exports=router;
