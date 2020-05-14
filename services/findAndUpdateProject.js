const PostModel = require('../models/post.model');
const ProjectModel = require('../models/project.model');

const findProject = async () => {
    try{
        const emptyProjectIdPosts = await PostModel.find({
            projectName: {
                $ne: ""
            },
            projectId: null
        })
            .limit(2000)
            .exec();

        if(emptyProjectIdPosts.length === 0){
            return;
        }

        const demo = async (post) => {
            console.log("project name of post: ", post.projectName)
            const project = await PostModel.findOne({name: post.projectName});

            if (project !== null) {
                post.projectId = project._id;
                console.log('project Id: ', post.projectId);
                await post.save();
            }

        };

        await Promise.all(emptyProjectIdPosts.map(demo));
    }catch(err){
        console.error(err);
    }
};

module.exports = findProject;