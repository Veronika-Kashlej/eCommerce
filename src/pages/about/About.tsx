import './About.css';
import logo from './assets/logo/logo.jpg';
import veronika from './assets/photos/veronika.jpeg';
import alexandr from './assets/photos/alexandr.png';
import kirill from './assets/photos/kirill.png';

function About() {
  const teamMembers = [
    {
      id: 1,
      name: 'Veronika',
      role: 'Team Lead',
      bio: '2nd year student. Former home baker, current barista and future frontend developer. In the project, I combine the roles of organizer and coder - I distribute tasks, monitor deadlines and write code at the same time. When not at the computer, I dance or play the piano, because life should be multifaceted!',
      github: 'https://github.com/Veronika-Kashlej',
      photo: veronika,
    },
    {
      id: 2,
      name: 'Alexandr',
      role: 'Frontend Developer',
      bio: 'A graduate of the Ukrainian State Marine Technical University with a degree in Ships and Ocean Engineering, who found his new element in code. In the project, he was responsible for API integrations and work with Commerce Tools, masterfully handling requests like a real captain with sea routes. Technical training in shipbuilding unexpectedly came in handy when designing "bridges" between the server and the client.',
      github: 'https://github.com/alvi0avcc',
      photo: alexandr,
    },
    {
      id: 3,
      name: 'Kirill',
      role: 'Frontend Developer',
      bio: 'Roofing specialist, father of a large family, where patience and multitasking are trained - ideal skills for development. In the project, he was responsible for everything related to user profiles: from authorization to personal data. He proved that you can work equally confidently with both building architecture and application architecture.',
      github: 'https://github.com/KirrBrest',
      photo: kirill,
    },
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <a href="https://rs.school/courses/javascript" target="_blank">
          <img src={logo} alt="RS School Logo" className="rs-logo" />
        </a>
        <h1>Our Development Team</h1>
        <p className="team-description">
          We are a passionate team of developers who came together through the RS School program.
          Our diverse skills and collaborative approach allowed us to create a product we're proud
          of. Each of us contributed something of our own: one thought through the logic, another
          followed the design, the third optimized the performance. The result was a project in
          which we invested knowledge, time and, of course, a couple of sleepless nights before the
          deadlines.
        </p>
      </div>

      <div className="team-members">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-member-card">
            <img src={member.photo} alt={member.name} className="member-photo" />
            <h2>{member.name}</h2>
            <h3>{member.role}</h3>
            <p className="member-bio">{member.bio}</p>
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              GitHub Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
