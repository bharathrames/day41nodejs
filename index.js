import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// Connect to Mongodb
mongoose
  .connect(
    "mongodb+srv://bharath91505:bharath123@cluster1.sjccidx.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(9000, () => {
      console.log("Server started on Port 9000");
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

//data models for Mentor and Student using Mongoose.
const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
});

const Mentor = mongoose.model("Mentor", mentorSchema);
const Student = mongoose.model("Student", studentSchema);


//Create mentor API

app.post("/taskmentors", async (req, res) => {
  try {
    const mentor = await Mentor.create(req.body);
    res.json(mentor);
  } catch (error) {
    console.error("Error creating mentor", error);
    res.status(500).json({ error: "Failed to create mentor" });
  }
});

//Create Student API
app.post("/taskstudents", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.json(student);
  } catch (error) {
    console.error("Error Creating Student", error);
    res.status(500).json({ error: "Failed to Create Student" });
  }
});

//assign a student to a mentor
app.put("/students/:studentId/assign-mentor/:mentorId", async (req, res) => {
  try {
    const { studentId, mentorId } = req.params;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { mentor: mentorId },
      { new: true }
    );
    res.json(student);
  } catch (error) {
    console.error("Error assigning mentor to student", error);
    res.status(500).json({ error: "Failed to assign mentor to student" });
  }
});

//add multiple students to a mentor.
app.put('/mentors/:mentorId/add-students', async (req, res)=>{
    try {
        const { mentorId } = req.params;
        const { studentIds } = req.body;

        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ error: "Mentor not Found" });
        }

        const students = await Student.updateMany(
            { _id: { $in: studentIds }, mentor: { $ne: mentorId} },
            { mentor: mentorId}
            );
        res.json(students);
    } catch (error) {
        console.error("Error adding students to mentor", error);
        res.status(500).json({ error: "Failed to add Students to mentor" });
        
    }
});

//assign or change the mentor for a particular student.
 app.put('/students/:studentId/assign-mentor/:mentorId',
 async (req, res) => {
    try {
        const { studentId, mentorId } = req.params;
        const student = await Student.findByIdAndUpdate(studentId,
            { mentor: mentorId }, { new: true});
            res.json(student);
    } catch (error) {
        console.error('Error Assigning/changing mentor for student', error);
        res.status(500).json({error: "Failed to assign or change mentor for students"});
    }
 });

 //show all students for a particular mentor.
 app.get('/mentors/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const students = await Student.find({mentor: mentorId });
        res.json(students);

    } catch (error) {
        console.error("Error showing students for mentor", error);
        res.status(500).json({error: "Failed to show students for mentor" });
    }
 });

//show the previously assigned mentor for a particular student.

app.get('/students/:studentId/previous-mentor', async (req, res) =>{
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).populate('mentor', 'name');
        const PreviousMentor = student.mentor ? student.mentor.name : "No Previous mentor assigned";
        res.json(PreviousMentor);
        
    } catch (error) {
        console.error("Error to fetch Previous mentor for student", error);
        res.status(500).json( { error: "Failed to show previous mentor for student"});
    }
});



