import React from "react";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";

export type NavigationProps = {
};

const Navigation: React.FunctionComponent<NavigationProps> = (p) => {
    return (
        <React.Fragment>
            <Navbar fixed="top"
                    className="mb-2"
                    bg="primary"
                    variant="dark">
                <Nav className="mr-auto">
                    <NavDropdown id="file-nav"
                                 title="File">
                        <NavDropdown.Item>Export level as JSON (experimental)</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown id="level-nav"
                                 title="Level">
                        <NavDropdown.Item>Change colors</NavDropdown.Item>
                        <NavDropdown.Item>Change</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar>
        </React.Fragment>
    )
};

export default Navigation;
