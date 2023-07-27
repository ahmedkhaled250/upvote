import mongoose from "mongoose";
const connectDB = async () => {
  return await mongoose
    .connect(process.env.DBURL)
    .then(() => console.log(`Connected DB............`))
    .catch((err) => console.log(`Fail to connect DB .......... ${err}`));
};
export default connectDB