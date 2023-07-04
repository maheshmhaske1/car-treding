const userModel = require('../model/user.model')
const mailMiddleware = require('../middleware/mail.middleware')
const jwtMiddleware = require('../middleware/auth')
const fs = require('fs-extra')
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const { default: mongoose } = require('mongoose');
const dotenv = require('dotenv').config()


exports.createUser = async (req, res) => {
    let { full_name, company_name, company_address, email, mobile, password, photo, DOB } = req.body

    const isUserFound = await userModel.findOne({ $or: [{ email: email }, { mobile: mobile }] })
    if (isUserFound) {
        return res.json({
            success: false,
            message: "user already exist please login"
        })
    }

    const hashed_password = await bcrypt.hash(password, 10);

    if (!req.file)
        return res.json({
            status: false,
            message: `please select image`,
        });

    const PAN = req.file.filename;
    console.log("PAN==>", PAN)
    await new userModel({
        full_name: full_name,
        company_name: company_name,
        company_address: company_address,
        email: email,
        mobile: mobile,
        password: hashed_password,
        DOB: DOB,
        photo: '',
        Pan: PAN
    }).save()
        .then(async (success) => {
            const token = await jwtMiddleware.generate_token_user(success._id, success.mobile)
            console.log(token)
            await userModel.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(success._id) },
                { $set: { token: token } },
                { returnOriginal: false }
            )
                .then((success) => {
                    return res.json({
                        success: true,
                        message: `user registered`,
                        data: success
                    })
                })
                .catch((error) => {
                    return res.json({
                        success: false,
                        message: "something went wrong", error
                    })
                })
        })
        .catch((error) => {
            return res.json({
                success: false,
                message: "something went wrong", error
            })
        })
}

exports.updateUser = async (req, res) => {
    const { userId } = req.params
    const { full_name, company_name, company_address, email, mobile, DOB } = req.body


    if (!userId)
        return res.json({
            status: false,
            message: `please select user_id`,
        })

    const users = await userModel.findById({ _id: userId })
    if (users == null || !users)
        return res.json({
            status: false,
            message: `invalid user_id`
        })

    const displayPhoto = req.file.filename
    await userModel.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(userId)
    },
        {
            $set: {
                full_name: full_name,
                company_name: company_name,
                company_address: company_address,
                email: email,
                mobile: mobile,
                password: hashed_password,
                DOB: DOB,
                Pan: displayPhoto
            }
        })
        .then((success) => {
            return res.json({
                success: true,
                message: `user updated`,
                data: success
            })
        })
        .catch((error) => {
            return res.json({
                success: false,
                message: "something went wrong", error
            })
        })
}

exports.login = async (req, res) => {
    let { username, password } = req.body

    // let error_message = `please enter`

    // if (!username) {
    //     error_message += `, email`
    // }
    // if (!password) {
    //     error_message += `, password`
    // }

    // if (error_message !== "please enter") {
    //     return res.json({
    //         success: false,
    //         message: error_message
    //     })
    // }


    const isUserFound = await userModel.findOne({ $or: [{ email: username }, { mobile: username }] })
    console.log(isUserFound)
    if (!isUserFound) {
        return res.json({
            success: false,
            message: "user not registered please register"
        })
    }

    if (bcrypt.compareSync(password, isUserFound.password)) {
        return res.json({
            success: true,
            message: `logged in`,
            data: isUserFound
        })
    }
    else {
        return res.json({
            success: false,
            message: `incorrect password`
        })
    }
}

exports.resetPassword = async (req, res) => {
    let { userId, newPassword } = req.body


    const isUserFound = await userModel.findOne({ _id: mongoose.Types.ObjectId(userId) })
    console.log(isUserFound)
    if (!isUserFound) {
        return res.json({
            success: false,
            message: "user not registered please register"
        })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await userModel.findByIdAndUpdate({ _id: isUserFound._id },
        {
            $set: {
                password: hashedNewPassword
            }
        })
        .then((success) => {
            console.log(success)
            if (success) {
                return res.json({
                    success: true,
                    message: "password changed successfully"
                })
            }
            x
        })
        .catch((error) => {
            return res.json({
                success: false,
                message: "error while changing password"
            })
        })
}

exports.isUserExist = async (req, res) => {
    let { username } = req.params

    // let error_message = `please enter`

    // if (!username) {
    //     error_message += `, email`
    // }

    // if (error_message !== "please enter") {
    //     return res.json({
    //         success: false,
    //         message: error_message
    //     })
    // }

    const isUserFound = await userModel.findOne({ $or: [{ email: username }, { mobile: username }] })
    if (!isUserFound) {
        return res.json({
            success: false,
            message: "email not registered"
        })
    }
    else {
        return res.json({
            success: true,
            message: "user found"
        })
    }

}

exports.getUser = async (req, res) => {
    let { userId } = req.params
    console.log(userId)

    const isUserFound = await userModel.findById({ _id: userId })
    if (!isUserFound) {
        return res.json({
            success: false,
            message: "user not found"
        })
    }
    else {
        return res.json({
            success: true,
            message: "user details",
            data: isUserFound
        })
    }

}

exports.deleteUser = async (req, res) => {
    let { userId } = req.params

    // let error_message = `please enter`

    // if (!username) {
    //     error_message += `, email`
    // }

    // if (error_message !== "please enter") {
    //     return res.json({
    //         success: false,
    //         message: error_message
    //     })
    // }

    const isUserFound = await userModel.findOneAndDelete({ userId: mongoose.Types.ObjectId(userId) })
        .then((success) => {
            return res.json({
                success: true,
                message: "user deleted",
                data: success
            })
        })
        .catch((error) => {
            return res.json({
                success: true,
                message: "something went wrong",
            })
        })
}

/* ---------- remove profile image ------------ */
exports.remove_profile_img = async (req, res) => {
    const { user_id } = req.body

    if (!user_id)
        return res.json({
            status: false,
            message: `please select user_id`,
        })

    const users = await userModel.findById({ _id: user_id })
    if (users == null || !users)
        return res.json({
            status: false,
            message: `invalid user_id`
        })

    user.findByIdAndUpdate({ _id: user_id },
        {
            $set: {
                displayPhoto: null
            }
        },
        { returnOriginal: true }
    )
        .then(async (success) => {
            let filename = success.displayPhoto
            await fs.remove(`./public/profile_images/${filename}`); // remove upload dir when uploaded bucket

            return res.json({
                status: true,
                message: `profile image removed`,
            })
        })
}

/* ---------- update profile image ------------ */
exports.add_profile_image = async (req, res) => {
    const { user_id } = req.params


    if (!req.file)
        return res.json({
            status: false,
            message: `please select image`,
        })

    if (!user_id)
        return res.json({
            status: false,
            message: `please select user_id`,
        })

    const users = await userModel.findById({ _id: user_id })
    if (users == null || !users)
        return res.json({
            status: false,
            message: `invalid user_id`
        })


    const displayPhoto = req.file.filename
    console.log(displayPhoto)
    userModel.findByIdAndUpdate({ _id: user_id },
        {
            $set: { photo: displayPhoto }
        },
        { returnOriginal: true }
    )
        .then(async (success) => {
            console.log(success)
            let filename = success.photo
            let root_url = req.protocol + "://" + req.headers.host
            let profile_url = root_url + "/profile_images/" + displayPhoto
            // await fs.remove(`./public/profile_images/${filename}`); // remove image from bucket

            return res.json({
                status: true,
                message: `profile image updated successfully`,
                data: {
                    user_id: success._id,
                    profile_images: profile_url
                }
            })
        })
        .catch((error) => {
            return res.json({
                status: false,
                message: `error`, error
            })
        })
}