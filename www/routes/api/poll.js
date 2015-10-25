var keystone = require('keystone');
var bcrypt = require('bcrypt');

var Poll = keystone.list('Poll');
var Vote = keystone.list('Vote');

/**
 * List Polls
 */
exports.list = function(req, res)
{
	Poll.model.find(function(err, items)
    {
		if (err)
			return res.apiError('database error', err);

		res.apiResponse({ polls: items });
	});
}

/**
 * Get Poll by ID
 */
exports.get = function(req, res)
{
	Poll.model.findById(req.params.id).exec(function(err, item)
    {
		if (err)
			return res.apiError('database error', err);
		if (!item)
			return res.apiError('not found');

		res.apiResponse({ poll: item });
	});
}

exports.latest = function(req, res)
{
	Poll.model.findOne()
		.sort('-publishedAt')
		.exec(function(err, item)
	    {
			if (err)
				return res.apiError('database error', err);
			if (!item)
				return res.apiError('not found');

			res.apiResponse({ poll: item });
		});
}

exports.getVote = function(req, res)
{
	if (!req.isAuthenticated() || !req.user.sub)
        return res.status(401).apiResponse({ 'error': 'not logged in' });

	Vote.getByPollIdAndVoter(
		req.params.id,
		req.user.sub,
		function(err, vote)
		{
			if (err)
				return res.apiError('database error', err);

			if (!vote)
				return res.status(404).apiResponse({
					error: 'vote does not exist'
				});

			return res.apiResponse({ vote: vote });
		}
	);
}

function vote(req, res, value)
{
	if (!req.isAuthenticated() || !req.user.sub)
		return res.status(401).apiResponse({ 'error': 'not logged in' });

	Poll.model.findById(req.params.id).exec(function(err, poll)
	{
		if (err)
			return res.apiError('database error', err);
		if (!poll)
			return res.apiError('not found');

		Vote.getByPollIdAndVoter(
			req.params.id,
			req.user.sub,
			function(err, vote)
			{
				if (err)
					return res.apiError('database error', err);

				console.log('getByPollIdAndVoter success');
				if (vote)
					return res.status(403).apiResponse({
						error: 'user already voted'
					});

				vote = Vote.model({
					poll: poll,
					voter: bcrypt.hashSync(req.user.sub, 10),
					value: value
				});

				vote.save(function(err)
				{
					res.apiResponse({ vote: vote });
				});
			}
		);
	});
}

exports.voteYes = function(req, res)
{
	vote(req, res, 'yes');
}

exports.voteBlank = function(req, res)
{
	vote(req, res, 'blank');
}

exports.voteNo = function(req, res)
{
	vote(req, res, 'no');
}
