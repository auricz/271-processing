This web application includes a Next.js frontend with an Express.js backend. There should also be a database, but as a prototype, the database is an array stored in memory.
Most of the work went into designing the backend, whereas the frontend was primarily vibe-coded. 
<br /><br />
Provided admin account:<br />
username: admin<br />
password: admin<br />
organization: ORG<br />
<br />
Provided user account:<br />
username: user<br />
password: user<br />
organization: ORG<br />
<h1>Overview</h1>
On the frontend, users can upload a photo of a driver's license or their health insurance card.
They select the type of document they are uploading, and the app will try to parse their information on the frontend.
After parsing, the user can manually fix any mistakes made by the parser. 
Once the information looks good, they can submit it to the backend to receive a [mock] 271 eligibility response.
They can then decide to publish and parse this response, so other users within the organization (front desk workers) can view the parsed response. 
Some security measures have been implemented with user accounts and roles.

<h1>Design</h1>
For this prototype, I went with using a JS OCR library to parse documents. 
There are 3rd-party API's that are specialized to parse such documents, however those require an account or payment, which I do not want to get for a prototype. 
If this was a real project and we used a 3rd-party API,
<ul>
  <li>We would need to share personally identifiable information with them
    <ul>
      <li>Are they HIPPA compliant?</li>
      <li>How strong is their data security? Could an attacker compromise their systems and be extracting all uploaded files?</li>
      <li>If they are using an AI, could that AI be training off of our uploaded images and potentially leak such information elsewhere?</li>
    </ul>
  </li>
  <li>We would need to set limits on how often the API gets called to avoid getting a massive bill</li>
  <li>If their servers go offline, our system also becomes partially unusable</li>
</ul>
Although I listed a lot of drawbacks, I think it'll be better to use an API to parse these documents as opposed to doing it in-house.
It is difficult to make a reliable OCR reader, more so in 3 days. 
This reader would need to handle all types of licenses and health cards from different states and companies.
All of which will have different designs and layouts. 
Not to mention handling unclear photos. 
Unless you have someone well-versed with developing an OCR and are willing to spend a lot of development time to make one in-house, I think an API is better. 
<br /><br />
Another major design decision was on parsing the 271 response. For this prototype, I used a library to parse it. 
The library works well enough for a prototype, and it even does some validation.
However, this library doesn't seem to be maintained anymore, so I would not use this in a real project.
I believe it would be better to develop a parser in-house since all you would need to do is follow the X12 specs.
I did not for this since it would take a significant amount of time for this project (or any prototype) that might end up going nowhere. 
<br /><br />
A major concern of this project was security, and I handled it with user accounts and roles. 
When a user creates an account, they need to register with their organization (unless it's a new organization, then they become the admin).
To prevent anyone from joining any organization, the org's admin must manually assign their role as a user or as another admin.
Users can send 271 responses to get the structured JSON back, as well as broadcast the JSON to all other users within the organization.
That way, only front desk staff working within the org are able to see the data. 
Admins are like users, but they can also assign roles or delete users (in case someone leaves the company). 
<h1>Limitations</h1>
<ul>
  <li>Since the "database" is just an array, the backend is doing a lot more work than necessary. It's O(n) time complexity for every operation, and it takes up O(n) memory that gets erased whenever the backend restarts.</li>
  <li>Right now, the OCR only works with the two photos in this repo. I used regular expressions to extract the data, which is not great for flexibility. Upload any other photo and it'll likely not work.</li>
  <li>The 271 parser library has some limitations that will never be addressed. For insurers who do not follow X12, we would need to develop a custom solution to parse their responses.</li>
  <li>Authentication is done by putting the credentials into the HTTP headers. It would be better to use JWT tokens or sessions, and also provide a way to recover an account.</li>
</ul>

<h1>Next Steps</h1>
If this was production, I would first get a database to store the user accounts and start looking into ID parsing API vendors. 
The parser could also be improved to work with non-X12-compliant responses.
And lastly, redo the frontend with clean code to make a more commercial-looking app.
