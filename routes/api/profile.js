const mongoose = require('mongoose');
const request = require('request');
const config = require('config');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator');

//get
// /api/profile/me
//@access -> private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate('user', [ 'name', 'avatar' ]);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (error) {
		console.log(error);
		res.status(500).send('Server  error');
	}
});

// post
//api/profile
//@private
router.post(
	'/',
	[
		auth,
		[ check('status', 'Status is required').not().isEmpty(), check('skills', 'Skills is required').not().isEmpty() ]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(1);
			return res.status(400).json({ msg: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		//build project object
		// Get fields
		const profileFields = {};
		profileFields.user = req.user.id;
		//if (handle) profileFields.handle = handle;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		// Skills - Spilt into array
		if (skills) {
			profileFields.skills = skills.split(',').map((skill) => skill.trim());
		}

		// Social
		profileFields.social = {}; //initialeize an objec social inside profileFields object
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// update old profile
				profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
				return res.json(profile);
			}

			// create new profile
			profile = new Profile(profileFields);
			await profile.save();

			res.json(profile);
		} catch (error) {
			console.log(2);
			console.log(error.message);
			return res.status(500).send('Server Error');
		}
	}
);

//get
//api/profile
// public
router.get('/', async (req, res) => {
	try {
		const profile = await Profile.find().populate('user', [ 'name', 'avatar' ]);
		res.json(profile);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

//get
//api/profile/user/:user_id
// public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [ 'name', 'avatar' ]);
		if (!profile) {
			return res.status(400).json({ msg: 'Profile Not Found' });
		}
		res.json(profile);
	} catch (error) {
		console.log(error.message);
		if (error.kind == 'ObjectId' || error.name == 'CastError') {
			return res.status(400).json({ msg: 'Profile Not Found' });
		}
		res.status(500).send('Server Error');
	}
});

//delete
//api/profile
// private
router.delete('/', auth, async (req, res) => {
	try {
		await Profile.findOneAndRemove({ user: req.user.id });
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User and Profile Deleted' });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

//put
//api/profile/experience
// private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is Required').not().isEmpty(),
			check('from', 'From date is Required').not().isEmpty(),
			check('company', 'Company is Required').not().isEmpty()
		]
	],
	async (req, res) => {
		const { title, company, location, from, to, current, description } = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp); //shifting new Exp object into the profile.experience object by using unshift as it shifts the data to the beginning rather then at the end

			await profile.save();
			res.json(profile);
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Server Error');
		}
	}
);

//delete experience
// api/profile/experience/exp_id
// private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		//get remove index
		const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id);

		profile.experience.splice(removeIndex, 1);
		await profile.save();

		res.json(profile);
	} catch (error) {
		console.log(error);
		res.status(500).send('Server error');
	}
});

//put
//api/profile/education
// private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is Required').not().isEmpty(),
			check('degree', 'Degree is Required').not().isEmpty(),
			check('fieldofstudy', 'Field of Study is Required').not().isEmpty(),
			check('from', 'From date is Required').not().isEmpty()
		]
	],
	async (req, res) => {
		const { school, degree, fieldofstudy, from, to, current, description } = req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu); //shifting new Exp object into the profile.education object by using unshift as it shifts the data to the beginning rather then at the end

			await profile.save();
			res.json(profile);
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Server Error');
		}
	}
);

//delete education
// api/profile/education/exp_id
// private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		//get remove index
		const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.edu_id);

		profile.education.splice(removeIndex, 1);
		await profile.save();

		res.json(profile);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server error');
	}
});

//get
// api/proflie/github/:username
// public
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${req.params
				.username}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' }
		};

		request(options, (err, response, body) => {
			if (err) console.log(err);

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No github Repo Found' });
			}

			res.send(JSON.parse(body));
		});
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
