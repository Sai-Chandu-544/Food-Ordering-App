const express=require("express");
const router=express.Router();
const middleware=require("./../middleware/middleware.js")


const {admin_register,admin_login,admin_logout,admin_result,admin_update,admin_delete,admin_itemName,admin_itemlist,admin_items,get_users,admin_cusine,get_user_orders}=require("./../controllers/admin_logic.js");





router.post("/register",admin_register)
router.post("/login",admin_login)
router.get("/logout",admin_logout)
router.post("/result",middleware,admin_result)
router.put("/update/:Title",middleware,admin_update)
router.delete("/delete/:foodName",middleware,admin_delete)
router.get("/menu",middleware,admin_itemlist)

router.get("/name/:menu_name",admin_itemName)   

router.get("/name/:menu_name",middleware,admin_itemName)   

router.get("/list/:item_type",middleware,admin_items)
router.get("/cusine/:cusine",middleware,admin_cusine)
router.get("/users",middleware,get_users)

router.get('/admin/orders', middleware,get_user_orders)




// console.log("Admin router loaded");


module.exports=router;
