export default function SplineModel() {
    const splineURL = "https://my.spline.design/particleaibrain-zVhc0jF06dyzlwrAQjDcfOXi/?logo=false&background=rgba(0,0,0,0)";

    return (
        <iframe
            src={splineURL}
            frameBorder='0'
            width='100%'
            height='100%'
            style={{ minHeight: '400px' }}
        ></iframe>
    );
}