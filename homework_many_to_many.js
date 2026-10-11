const mongoose = require("mongoose");
const { Schema } = mongoose;

const MONGO_URI = "mongodb://127.0.0.1:27017/course_registration_db";

const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  maxStudents: { type: Number, required: true },
  availableSlots: { type: Number, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
});

const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);

async function enrollCourse(studentId, courseId) {
  try {
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      console.log("❌ Lỗi: Sinh viên hoặc Môn học không tồn tại.");
      return;
    }

    const isAlreadyEnrolled = student.courses.some(
      (cId) => cId.toString() === courseId.toString(),
    );
    if (isAlreadyEnrolled) {
      console.log(
        `⚠️  [ĐÃ ĐĂNG KÝ] Sinh viên '${student.name}' đã đăng ký môn '${course.title}' trước đó rồi!`,
      );
      return;
    }

    if (course.availableSlots <= 0) {
      console.log(
        `⚠️  [HẾT CHỖ] Môn học '${course.title}' đã hết chỗ trống (availableSlots = 0)!`,
      );
      return;
    }

    student.courses.push(courseId);
    await student.save();

    course.students.push(studentId);
    course.availableSlots -= 1;
    await course.save();

    console.log(
      `✅ [THÀNH CÔNG] Đăng ký môn '${course.title}' cho sinh viên '${student.name}'. Số chỗ còn lại: ${course.availableSlots}`,
    );
  } catch (error) {
    console.error("❌ Lỗi khi thực hiện enrollCourse:", error.message);
  }
}

async function dropCourse(studentId, courseId) {
  try {
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      console.log("❌ Lỗi: Sinh viên hoặc Môn học không tồn tại.");
      return;
    }

    const isEnrolled = student.courses.some(
      (cId) => cId.toString() === courseId.toString(),
    );
    if (!isEnrolled) {
      console.log(
        `⚠️  [CHƯA ĐĂNG KÝ] Sinh viên '${student.name}' chưa đăng ký môn '${course.title}' nên không thể hủy!`,
      );
      return;
    }

    student.courses = student.courses.filter(
      (cId) => cId.toString() !== courseId.toString(),
    );
    await student.save();

    course.students = course.students.filter(
      (sId) => sId.toString() !== studentId.toString(),
    );
    course.availableSlots += 1;
    await course.save();

    console.log(
      `✅ [THÀNH CÔNG] Hủy môn '${course.title}' cho sinh viên '${student.name}'. Số chỗ còn lại: ${course.availableSlots}`,
    );
  } catch (error) {
    console.error("❌ Lỗi khi thực hiện dropCourse:", error.message);
  }
}

async function runTests() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("-> Đã kết nối MongoDB thành công.");

    await Student.deleteMany({});
    await Course.deleteMany({});

    const student1 = await Student.create({
      name: "Nguyen Van A",
      email: "vana@gmail.com",
    });
    const student2 = await Student.create({
      name: "Tran Thi B",
      email: "thib@gmail.com",
    });

    const course1 = await Course.create({
      title: "Web Backend Development",
      code: "CS301",
      maxStudents: 1,
      availableSlots: 1,
    });

    console.log("\n--- BẮT ĐẦU KIỂM THỬ ENROLL & DROP ---");

    // Test 1: Đăng ký thành công
    await enrollCourse(student1._id, course1._id);

    // Test 2: Đăng ký trùng lặp (Thất bại)
    await enrollCourse(student1._id, course1._id);

    // Test 3: Đăng ký khi đã hết chỗ (Thất bại)
    await enrollCourse(student2._id, course1._id);

    // Test 4: Hủy môn học thành công
    await dropCourse(student1._id, course1._id);

    // Test 5: Sinh viên 2 đăng ký lại sau khi môn học có chỗ trống
    await enrollCourse(student2._id, course1._id);
  } catch (err) {
    console.error("Lỗi chương trình:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\n-> Đã ngắt kết nối MongoDB.");
  }
}

runTests();
