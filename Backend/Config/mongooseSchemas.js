import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    active: {type: Boolean, required: true},
});

const UserModel = model('users', UserSchema);


const VerificationTokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
})

const VerificationTokenModel = model('verificationToken', VerificationTokenSchema);

export { UserModel, VerificationTokenModel };