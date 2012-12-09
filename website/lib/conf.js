module.exports = {
	development: {
		box: { // callback: http://localhost:300/auth/box/callback
			apiKey: 'ujdb2e8pe3geqmkgm2fg66pg552dwl2f'
		}
    }
    , production: {
		box: { // callback: http://sw.ap01.aws.af.cm/auth/box/callback
			apiKey: 'ch60klzmc4zksm3l101169y7sr371ck0'
		}
    }
    , formats: {
    	'import': ['ipt', 'sat', 'dwg', 'stl']
    	, 'export': ['dwg', 'dwf', 'stl', 'sat', '3ds', 'nwc', 'nwf', 'f3d', 'stp', 'step', 'png', 'pdf']
    }
};
